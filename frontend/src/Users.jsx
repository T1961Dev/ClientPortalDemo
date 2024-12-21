import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Row, Col, Spin, Layout, Modal, notification, Form, Input } from 'antd';
import Sidebar from './Sidebar'; // Assuming Sidebar component is in the same folder
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;

export default function Users() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null); // State to store form data
  const [role, setRole] = useState('client'); // State to store selected role
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8080/getCompanies');
        const data = await response.json();
        if (response.ok) {
          setCompanies(data.companies);
        } else {
          throw new Error(data.error || 'Failed to fetch companies');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching companies');
        console.log(err);
        notification.error({
          message: 'Error',
          description: err.message || 'An error occurred while fetching companies',
        });
      }
    };

    fetchCompanies();
  }, []);

  const fetchUsersByCompany = async () => {
    try {
      if (!selectedCompany) {
        setError('Please select a company');
        notification.warning({
          message: 'Warning',
          description: 'Please select a company first.',
        });
        return;
      }
  
      setLoading(true);
      const apiUrl = `http://127.0.0.1:8080/getUsersByCompany?company_name=${selectedCompany}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (response.ok) {
        setUsers(data.users);
        if (data.users.length === 0) {
          notification.warning({
            message: 'No Users Found',
            description: `No users are associated with the company "${selectedCompany}".`,
          });
        }
      } else {
        // Trigger error notification for API errors
        notification.error({
          message: 'Error',
          description: data.error || 'Failed to fetch users',
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users');
      notification.error({
        message: 'Error',
        description: err.message || 'An error occurred while fetching users',
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    setUsers([]); // Reset users when company changes
  };

  const handleUserClick = (user) => {
    navigate(`/user/${user.id}`, { state: { user } });
  };

  const handleModalOpen = () => {
    setIsModalVisible(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false); // Close the modal
    form.resetFields(); // Reset form fields
  };

  const handleModalSubmit = async (values) => {
    try {
      console.log("Form Data:", values); // Log the form data for debugging
      values.role = role; // Include the role in the form submission

      const response = await fetch('http://127.0.0.1:8080/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      notification.success({
        message: 'Form Submitted',
        description: data.message || 'User has been successfully added.',
      });
      setIsModalVisible(false); // Close the modal
      form.resetFields(); // Reset form fields after submission
    } catch (err) {
      console.error("Error:", err); // Log error details for debugging
      notification.error({
        message: 'Error',
        description: err.message || 'An error occurred while submitting the form.',
      });
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Sider
        width={200}
        className="site-layout-background"
        style={{ backgroundColor: '#fff', boxShadow: 'none' }} // Make the sidebar white and remove shadow
      >
        <Sidebar /> {/* Sidebar stays fixed here */}
      </Sider>
      <Layout style={{ padding: 0 }}> {/* Remove padding to avoid grey gap */}
        <Content
          style={{
            padding: '24px', // Adjust content padding to your liking
            background: '#fff',
            minHeight: '280px',
          }}
        >
          <Card title="Select Company" style={{ marginBottom: '20px' }}>
            <Select
              value={selectedCompany}
              onChange={handleCompanyChange}
              style={{ width: '200px', marginRight: '10px' }}
            >
              <Select.Option value="">Select a company</Select.Option>
              {companies.map((company, index) => (
                <Select.Option key={index} value={company}>
                  {company}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={fetchUsersByCompany}
              disabled={!selectedCompany} // Disable until company is selected
            >
              Fetch Users
            </Button>
            <Button
              type="default"
              onClick={handleModalOpen} // Open modal when clicked
              style={{ marginLeft: '10px', backgroundColor: '#e1e1e1' }}
            >
              Add User
            </Button>
          </Card>

          <Row gutter={16}>
            {loading ? (
              <Col span={24}>
                <Spin size="large" />
                <p>Loading users...</p>
              </Col>
            ) : users.length > 0 ? (
              users.map((user) => (
                <Col key={user.id} span={8}>
                  <Card
                    hoverable
                    onClick={() => handleUserClick(user)}
                    cover={<div style={{ height: '100px', backgroundColor: '#e1e1e1' }} />}
                  >
                    <Card.Meta
                      title={user.name}
                      description={""}
                    />
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <p>No users found</p>
              </Col>
            )}
          </Row>

          {/* Display the form data */}
          {formData && (
            <div style={{ marginTop: '20px' }}>
              <h3>Form Data:</h3>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          )}
        </Content>
      </Layout>

      {/* Modal Component */}
      <Modal
        title="User Information"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item
            label="User Name"
            name="username"
            rules={[{ required: true, message: 'Please enter the user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Company"
            name="company"
            rules={[{ required: true, message: 'Please select a company' }]}
          >
            <Select
              placeholder="Select a company"
              style={{ width: '100%' }}
              allowClear
            >
              {companies.map((company, index) => (
                <Select.Option key={index} value={company}>
                  {company}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter the email' }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter the password' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Auth ID"
            name="authId"
            rules={[{ required: true, message: 'Please enter the Auth ID' }]}
          >
            <Input placeholder="Enter Auth ID" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select the role' }]}
          >
            <Select
              value={role}
              onChange={(value) => setRole(value)} // Update role selection
              style={{ width: '100%' }}
            >
              <Select.Option value="client">Client</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
