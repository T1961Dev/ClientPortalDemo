import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Spin, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Sider, Content } = Layout;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8080/getAllCompanies');
        const data = await response.json();
        if (response.ok) {
          setCompanies(data.companies);
        } 
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyClick = (company) => {
    navigate(`/company/${company.id}`, { state: { company } }); // Pass company details to CompanyDetails page
  };

  if (loading) {
    return <Spin tip="Loading companies..." />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <Sidebar />
      </Sider>
      <Layout>
        <Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          <h2>Companies</h2>
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            {companies.map((company) => (
              <Col key={company.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={company.name}
                  bordered
                  hoverable
                  style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                  onClick={() => handleCompanyClick(company)}
                >
                  
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CompanyList;
