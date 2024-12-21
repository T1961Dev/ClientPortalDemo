import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Spin, notification, Layout } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Sider, Content } = Layout;

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch projects and companies from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const userAuthId = sessionStorage.getItem('userId'); // Fetch the userAuthId from sessionStorage
  
      if (!userAuthId) {
        notification.error({
          message: 'Error',
          description: 'User authentication ID is missing.',
        });
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch('http://127.0.0.1:8080/getClientsProjects', {
          method: 'POST', // Using POST to send userAuthId
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authId: userAuthId }), // Send the authId in the request body
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setProjects(data.projects);
          setFilteredData(data.projects); // Initially, set filtered data to all projects
        } 
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Filter by project name, company name, or any other column
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(value.toLowerCase()) ||
        project.company_name.toLowerCase().includes(value.toLowerCase()) ||
        project.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Company Name',
      dataIndex: 'company', // Assuming your project data has a `company_name` field
      key: 'company',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },
  ];

  if (loading) return <Spin tip="Loading projects..." />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ backgroundColor: '#fff' }}>
        <Sidebar />
      </Sider>
      <Layout>
        <Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          <h2>My Projects</h2>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search project name, company name, etc."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={handleSearch}
            />
          </Space>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 20 }}
            onRow={(record) => ({
              onClick: () => {
                // Navigate to the project details page with project data
                navigate(`/project/${record.id}`, { state: { project: record } });
              },
            })}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProjectList;
