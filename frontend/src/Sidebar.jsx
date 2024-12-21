import React, { useState, useEffect } from 'react';
import { Layout, Menu, notification } from 'antd';
import { DashboardOutlined, UserOutlined, BankOutlined, ProjectOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userId = sessionStorage.getItem('userId'); // Get the user ID from sessionStorage
        if (!userId) {
          notification.error({
            message: 'Error',
            description: 'User ID not found in session.',
          });
          return;
        }

        const response = await fetch(`http://127.0.0.1:8080/getUser?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          // Assuming the role field is in the user data
          setIsAdmin(data.role === 'admin'); // Set isAdmin based on the role field
        } else {
          notification.error({
            message: 'Error',
            description: data.error || 'Failed to fetch user data.',
          });
        }
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Failed to fetch user data.',
        });
      }
    };

    checkUserRole();
  }, []); // Run once when the component mounts

  const handleMenuClick = (e) => {
    if (e.key === 'dashboard') {
      navigate('/dashboard');
    } else if (e.key === 'users') {
      navigate('/users');
    } else if (e.key === 'companies') {
      navigate('/companies');
    } else if (e.key === 'projects') {
      navigate('/projects');
    } else if (e.key === 'myprojects') {
      navigate('/myprojects');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Sidebar */}
      <Sider width={200} style={{ backgroundColor: '#fff', padding: 0, margin: 0 }}>
        <Menu
          mode="inline"
          selectedKeys={[
            currentPath === '/dashboard'
              ? 'dashboard'
              : currentPath === '/users'
              ? 'users'
              : currentPath === '/companies'
              ? 'companies'
              : currentPath === '/projects'
              ? 'projects'
              : currentPath === '/myprojects'
              ? 'myprojects'
              : 'dashboard',
          ]}
          onClick={handleMenuClick}
          style={{
            height: '100%',
            borderRight: 0,
            paddingTop: 20,
            backgroundColor: '#fff',
            margin: 0,
          }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} style={{ backgroundColor: 'transparent' }}>
            Dashboard
          </Menu.Item>

          {!isAdmin && (
            <>
              
              
              <Menu.Item key="myprojects" icon={<ProjectOutlined />} style={{ backgroundColor: 'transparent' }}>
                My Projects
              </Menu.Item>
            </>
          )}
          {/* Conditionally render these menu items based on user role */}
          {isAdmin && (
            <>
              <Menu.Item key="users" icon={<UserOutlined />} style={{ backgroundColor: 'transparent' }}>
                Users
              </Menu.Item>
              <Menu.Item key="companies" icon={<BankOutlined />} style={{ backgroundColor: 'transparent' }}>
                Companies
              </Menu.Item>
              <Menu.Item key="projects" icon={<ProjectOutlined />} style={{ backgroundColor: 'transparent' }}>
                Projects
              </Menu.Item>
            </>
          )}
        </Menu>
      </Sider>

      {/* Content Area */}
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ padding: '20px', backgroundColor: '#fff', margin: 0 }}>
          {/* Your Content goes here */}
        </Content>
      </Layout>
    </Layout>
  );
}
