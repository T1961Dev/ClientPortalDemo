import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, Spin, notification, Modal, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Sider, Content } = Layout;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility for adding company
  const [newCompanyName, setNewCompanyName] = useState(""); // New company name input
  const navigate = useNavigate();

  // Fetch companies from the backend on component mount
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

  // Handle clicking on a company
  const handleCompanyClick = (company) => {
    navigate(`/company/${company.id}`, { state: { company } });
  };

  // Open the modal for adding a company
  const handleModalOpen = () => {
    setModalVisible(true);
  };

  // Close the modal for adding a company
  const handleModalClose = () => {
    setModalVisible(false);
  };

  // Add a new company via a POST request to the backend
  const handleAddCompany = async () => {
    if (!newCompanyName) {
      notification.error({
        message: 'Error',
        description: 'Company name is required!',
      });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8080/addCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCompanyName }),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Company added successfully!',
        });
        setCompanies((prevCompanies) => [...prevCompanies, data.company]); // Update company list
        setModalVisible(false); // Close modal after success
      } else {
        notification.error({
          message: 'Error',
          description: data.error || 'Failed to add company',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Error',
        description: 'An error occurred while adding the company.',
      });
    }
  };

  // Show loading spinner while fetching companies
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
          {/* Title and Add Company button inline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Companies</h2>
            <Button onClick={handleModalOpen} type="primary">
              Add Company
            </Button>
          </div>

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
                />
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>

      {/* Modal for adding a new company */}
      <Modal
        title="Add New Company"
        visible={modalVisible}
        onCancel={handleModalClose}
        onOk={handleAddCompany}
      >
        <Input
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="Enter company name"
        />
      </Modal>
    </Layout>
  );
};

export default CompanyList;
