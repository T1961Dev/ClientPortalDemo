import React, { useEffect, useState } from 'react';
import { Layout, Card, Spin } from 'antd';
import Sidebar from './Sidebar'; // Import Sidebar component
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          setError('User ID not found in session');
          navigate("/auth");
          return;
        }

        const response = await fetch(`http://127.0.0.1:8080/getUser?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data);
        } else {
          setError(data.error || 'Failed to fetch user data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      }
    };

    fetchUser();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <Spin size="large" />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <Sidebar /> {/* Use the Sidebar component here */}
      </Sider>

      <Layout style={{ padding: 0 }}>
        <Content
          style={{
            padding: 24,
          
            minHeight: 280,
            background: '#fff',
          }}
        >
          <div className="dashboard" style={{ padding: '0' }}>
            <Card className="box user-info" title="User Info" style={{ marginBottom: '20px' }}>
              <h1>Welcome, {user.name || 'User'}!</h1>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
              <p>Company: {user.company}</p>
            </Card>

            {/* Other Dashboard content can be added here */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
