import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Card, List, Spin, Button, notification } from 'antd';

const { Sider, Content } = Layout;

const CompanyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
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
        setLoading(false);
      }
    };

    fetchUsers();
  }, [company, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      <Layout>
        <Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          <Button onClick={() => navigate('/companies')} style={{ marginBottom: 20 }}>
            Back to Companies
          </Button>
          <Card
            title={company.name}
            bordered
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: 20,
            }}
          >
            
          </Card>

          <h3>Users in this company:</h3>
          {loading ? (
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default CompanyDetails;
