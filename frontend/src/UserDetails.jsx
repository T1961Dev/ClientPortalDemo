import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Typography, Modal, Form, Input, message } from 'antd';

const { Title, Paragraph } = Typography;

export default function UserDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {}; // Retrieve the user from location state

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For delete confirmation modal
  const [form] = Form.useForm();

  // Handle modal open/close
  const showModal = () => {
    form.setFieldsValue(user); // Pre-fill form with user data
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Handle form submission
  const handleSave = async (values) => {
    try {
      const response = await fetch('http://localhost:8080/api/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...user, ...values }), // Merge updates with existing user data
      });

      if (response.ok) {
        message.success('User updated successfully');
        setIsModalOpen(false);
        navigate(0); // Refresh the page to reflect changes
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Handle user deletion
  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }), // Send email to identify the user
      });

      if (response.ok) {
        message.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        navigate('/users'); // Navigate back to the Users list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Check if user data is available
  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Back button */}
      <Button
        type="primary"
        style={{ marginBottom: '20px' }}
        onClick={() => navigate('/users')} // Navigate back to Users tab
      >
        Back
      </Button>

      {/* User details card */}
      <Row justify="center">
        <Col span={12}>
          <Card title="User Details" bordered={false}>
            <Title level={2}>{user.name}</Title>
            <Paragraph><strong>Email:</strong> {user.email || 'Email not available'}</Paragraph>
            <Paragraph><strong>Role:</strong> {user.role}</Paragraph>
            <Paragraph><strong>Company:</strong> {user.company}</Paragraph>

            {/* Edit and Delete buttons */}
            <Button type="primary" onClick={showModal} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button type="danger" onClick={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        visible={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()} // Submit the form
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please enter the role' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        visible={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
