import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Card, List, Spin, Button, notification, Modal, Form, Input, Select, DatePicker } from 'antd';

const { Content } = Layout;

const CompanyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false); // Modal visibility state for users
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false); // Modal visibility state for projects
  const [form] = Form.useForm();
  const [role, setRole] = useState('client'); // State to store selected role
  const [projectForm] = Form.useForm();
  const company = location.state?.company;

  useEffect(() => {
    if (!company) {
      notification.error({
        message: 'Error',
        description: 'Company details are missing!',
      });
      navigate('/companies'); // Redirect back if no company details
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/getUsersByCompany?company_name=${company.name}`
        );
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
        } else {
          throw new Error(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        notification.error({
          message: 'Error',
          description: err.message || 'Failed to fetch users',
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/getProjectsByCompany?company_name=${company.name}`
        );
        const data = await response.json();

        if (response.ok) {
          setProjects(data.projects);
        } else {
          throw new Error(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        notification.error({
          message: 'Error',
          description: err.message || 'Failed to fetch projects',
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUsers();
    fetchProjects();
  }, [company, navigate]);

  // Handle Modal visibility for User
  const handleUserModalOpen = () => {
    setIsUserModalVisible(true); // Open the modal for adding a user
  };

  const handleUserModalClose = () => {
    setIsUserModalVisible(false); // Close the modal
    form.resetFields(); // Reset form fields
  };

  const handleUserModalSubmit = async (values) => {
    try {
      values.company = company.name; // Set company name automatically

      const response = await fetch('http://127.0.0.1:8080/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      notification.success({
        message: 'User Added',
        description: data.message || 'User has been successfully added.',
      });

      setIsUserModalVisible(false); // Close the modal
      form.resetFields(); // Reset form fields after submission
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'An error occurred while adding the user.',
      });
    }
  };

  // Handle Modal visibility for Project
  const handleProjectModalOpen = () => {
    setIsProjectModalVisible(true); // Open the modal for adding a project
  };

  const handleProjectModalClose = () => {
    setIsProjectModalVisible(false); // Close the modal
    projectForm.resetFields(); // Reset form fields
  };

  const handleProjectModalSubmit = async (values) => {
    try {
      // Format the start_date and end_date to strings (YYYY-MM-DD)
      const startDateFormatted = values.start_date ? values.start_date.format('YYYY-MM-DD') : '';
      const endDateFormatted = values.end_date ? values.end_date.format('YYYY-MM-DD') : '';
  
      // Update values with formatted dates
      values.start_date = startDateFormatted;
      values.end_date = endDateFormatted;
      values.company = company.name; // Set company name automatically
  
      console.log('Submitting project with values:', values); // Log the values for debugging
  
      const response = await fetch('http://127.0.0.1:8080/createProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
      console.log('API response:', data); // Log the response to check
  
      if (response.ok) {
        notification.success({
          message: 'Project Added',
          description: data.message || 'Project has been successfully added.',
        });
  
        // After adding project, refetch the project list
        const fetchProjects = async () => {
          try {
            const response = await fetch(
              `http://127.0.0.1:8080/getProjectsByCompany?company_name=${company.name}`
            );
            const data = await response.json();
            setProjects(data.projects);
          } catch (err) {
            notification.error({
              message: 'Error',
              description: err.message || 'Failed to fetch projects',
            });
          }
        };
  
        fetchProjects();
        setIsProjectModalVisible(false); // Close the modal
        projectForm.resetFields(); // Reset form fields after submission
      } else {
        notification.error({
          message: 'Error',
          description: data.message || 'An error occurred while adding the project.',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err.message || 'An error occurred while adding the project.',
      });
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          <Button onClick={() => navigate('/companies')} style={{ marginBottom: 20 }}>
            Back to Companies
          </Button>
          <Card
            title={<h2>{company?.name}</h2>} // Main company title
            bordered
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: 20,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ display: 'inline-block', marginRight: 10 }}>Users in this company:</h4>
              <Button type="primary" onClick={handleUserModalOpen} style={{ display: 'inline-block' }}>
                Add User
              </Button>
            </div>
            {loadingUsers ? (
              <Spin tip="Loading users..." />
            ) : (
              <List
                bordered
                dataSource={users}
                renderItem={(user) => (
                  <List.Item
                    onClick={() => navigate(`/user/${user.id}`, { state: { user } })}
                    style={{ cursor: 'pointer' }}
                  >
                    {user.name}
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Projects in this company:</h3>
                <Button type="primary" onClick={handleProjectModalOpen}>
                  Add Project
                </Button>
              </div>
            }
            bordered
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: 20,
            }}
          >
            {loadingProjects ? (
              <Spin tip="Loading projects..." />
            ) : (
              <List
                bordered
                dataSource={projects}
                renderItem={(project) => (
                  <List.Item
                    onClick={() => navigate(`/projects/`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {project.name}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Content>
      </Layout>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        visible={isUserModalVisible} // Ensure this state controls visibility
        onCancel={handleUserModalClose} // Close the modal when clicked outside or on cancel
        footer={null} // No footer buttons
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleUserModalSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter the user email' }]}
          >
            <Input placeholder="Enter user email" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select the user role' }]}
          >
            <Select value={role} onChange={setRole} placeholder="Select role">
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

      {/* Add Project Modal */}
      <Modal
        title="Add New Project"
        visible={isProjectModalVisible}
        onCancel={handleProjectModalClose}
        footer={null}
        width={500}
      >
        <Form form={projectForm} layout="vertical" onFinish={handleProjectModalSubmit}>
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="start_date"
            rules={[{ required: true, message: 'Please select the start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="end_date"
            rules={[{ required: true, message: 'Please select the end date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
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
};

export default CompanyDetails;
