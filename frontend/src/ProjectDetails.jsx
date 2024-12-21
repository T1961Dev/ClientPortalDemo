import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, Card, List, Spin, notification, Modal, Select, Input, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Content } = Layout;

const ProjectDetails = () => {
  const { state } = useLocation(); // Get project state
  const navigate = useNavigate();
  const [project, setProject] = useState(state?.project || {});
  
  const [users, setUsers] = useState([]); // Users assigned to the project
  const [allCompanyUsers, setAllCompanyUsers] = useState([]); // Users in the company
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); // Users to be added to the project
  const { project_id } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Ref to ensure API calls are not triggered multiple times
  const hasFetchedUsers = useRef(false);
  const hasFetchedCompanyUsers = useRef(false);
  const hasFetchedMessages = useRef(false);

  // UseEffect hook to load project details and make API calls
  useEffect(() => {
    if (!project?.id) {
      notification.error({
        message: 'Error',
        description: 'No project data found!',
      });
      navigate('/projects');
      return;
    }

    const fetchUsers = async () => {
      if (hasFetchedUsers.current) return; // Prevent fetching users again
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/getUsersByProject?project_id=${project.id}`
        );
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
          hasFetchedUsers.current = true;
        } else {
          throw new Error(data.error || 'Failed to fetch users');
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch users',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyUsers = async () => {
      if (hasFetchedCompanyUsers.current) return; // Prevent fetching company users again
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/getUsersByCompany?company_name=${project.company}`
        );
        const data = await response.json();
        if (response.ok) {
          const filteredUsers = data.users.filter(
            (user) => !users.some((assignedUser) => assignedUser.id === user.id)
          );
          setAllCompanyUsers(filteredUsers);
          hasFetchedCompanyUsers.current = true;
        } else {
          throw new Error(data.error || 'Failed to fetch company users');
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch company users',
        });
      }
    };

    const fetchComments = async () => {
      if (hasFetchedMessages.current) return; // Prevent fetching messages again
    
      try {
        // Retrieve userId from sessionStorage
        const userId = sessionStorage.getItem('userId');  // Assuming the userId is stored in sessionStorage
    
        if (!userId) {
          throw new Error('User ID not found in sessionStorage');
        }
    
        // Fetch comments by projectId and userId
        const response = await fetch(
          `http://127.0.0.1:8080/getCommentsByProject?project_id=${project.id}&user_id=${userId}`
        );
    
        const data = await response.json();
    
        if (response.ok) {
          setMessages(data.comments); // Set the messages state with the fetched comments
          hasFetchedMessages.current = true; // Prevent further fetching
        } else {
          throw new Error(data.error || 'Failed to fetch comments');
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch comments',
        });
      }
    };

    const checkIsAdmin = async () => {
      try {
        // Retrieve authId from sessionStorage
        const authId = sessionStorage.getItem('userId');
    
        if (!authId) {
          throw new Error('Auth ID not found in sessionStorage');
        }
    
        // Fetch admin status
        const response = await fetch(
          `http://127.0.0.1:8080/isAdmin?authId=${encodeURIComponent(authId)}`
        );
    
        const data = await response.json();
    
        if (response.ok) {
          setIsAdmin(data.isAdmin); // Update the state
          console.log(data.isAdmin);
        } else {
          throw new Error(data.error || 'Failed to fetch admin status');
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch admin status',
        });
      }
    };
    
    
    // Assuming you have a useEffect to call this on load
    
    
    
    
    

    // Trigger all fetches only once
    fetchUsers();
    fetchCompanyUsers();
    fetchComments();
    checkIsAdmin();
  }, [project, users]);

  // Add selected users to the project
  const handleAddUsers = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/addUsersToProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project.id,
          user_ids: selectedUsers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'Users Added',
          description: 'The users have been added to the project.',
        });
        setUsers((prev) => [
          ...prev,
          ...allCompanyUsers.filter((user) => selectedUsers.includes(user.id)),
        ]);
        setModalVisible(false);
      } else {
        throw new Error(data.error || 'Failed to add users');
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to add users',
      });
    }
  };

  // Remove user from the project
  const handleRemoveUser = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/removeUserFromProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          project_id: project.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'User Removed',
          description: 'The user has been removed from the project.',
        });
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        throw new Error(data.error || 'Failed to remove user');
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to remove user',
      });
    }
  };

  // Send message to project chat
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      message.error('Please type a message');
      return;
    }
  
    const sender = sessionStorage.getItem("userId");
    if (!sender) {
      message.error('User authentication ID is missing. Please log in again.');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:8080/addComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project.id,
          comment: newMessage,
          sender: sender, // Authenticated user ID
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Fetch the user name for the sender (only after the comment is added)
        const userNameResponse = await fetch(`http://127.0.0.1:8080/getUserNameById?user_id=${sender}`);
        const userNameData = await userNameResponse.json();
        if (userNameResponse.ok) {
          // Add userName to the comment and update state
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...data.comment, userName: userNameData.name }, // Add userName to the comment
          ]);
          setNewMessage(''); // Clear the input field
        } else {
          throw new Error('Failed to fetch user name');
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      message.error(error.message || 'Failed to send message');
    }
  };
  
  

  // Open modal to add users
  const handleOpenModal = () => {
    setModalVisible(true);
    setSelectedUsers([]); // Reset selected users when opening modal
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '20px', backgroundColor: '#fff' }}>
        <Button onClick={() => navigate('/projects')} style={{ marginBottom: '20px' }}>
          Back to Projects
        </Button>

        <Card title={project.name} style={{ marginBottom: '20px' }}>
          <p><strong>Company:</strong> {project.company}</p>
          <p><strong>Description:</strong> {project.description}</p>
        </Card>

        <h3>Users Involved:</h3>
        {loading ? (
          <Spin tip="Loading users..." />
        ) : (
          <List
  bordered
  dataSource={users}
  renderItem={(user) => (
    <List.Item
      actions={
        isAdmin
          ? [<Button type="link" danger onClick={() => handleRemoveUser(user.id)}>❌</Button>]
          : []
      }
    >
      {user.name}
    </List.Item>
  )}
/>
        )}

{isAdmin && (
        <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: '16px' }}>
          Add User
        </Button>
      )}

        <Modal
          title="Add Users to Project"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleAddUsers}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select users"
            value={selectedUsers}
            onChange={setSelectedUsers}
          >
            {allCompanyUsers.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Modal>

        <h3>Project Chat</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', marginBottom: '10px', padding: '10px' }}>
  {messages.map((msg) => (
    <div key={msg.id}>
      <strong>{msg.userName}:</strong> {msg.content}  {/* Display the sender's name */}
    </div>
  ))}
</div>


        <Input
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage}>
          Send
        </Button>
      </Content>
    </Layout>
  );
};

export default ProjectDetails;
