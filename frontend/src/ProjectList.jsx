import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Spin, notification, Layout, Modal, Form, Select, Button, DatePicker } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Sider, Content } = Layout;
const { Option } = Select;

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [form] = Form.useForm();

  // Fetch projects and companies
  useEffect(() => {
    const fetchProjectsAndCompanies = async () => {
      setLoading(true);
      try {
        const projectResponse = await fetch('http://127.0.0.1:8080/getAllProjects');
        const companyResponse = await fetch('http://127.0.0.1:8080/getAllCompanies');
        const projectData = await projectResponse.json();
        const companyData = await companyResponse.json();
  
        if (projectResponse.ok && companyResponse.ok) {
          // Map company name to each project based on company_id
          const projectsWithCompanyName = projectData.projects.map((project) => {
            const company = companyData.companies.find((c) => c.id === project.company);
            return {
              ...project,
              company_name: company ? company.name : 'Unknown', // Set company name if found, otherwise 'Unknown'
            };
          });
  
          setProjects(projectsWithCompanyName);
          setFilteredData(projectsWithCompanyName);
          setCompanies(companyData.companies);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        notification.error({
          message: 'Error',
          description: err.message || 'Failed to fetch data',
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjectsAndCompanies();
  }, []);
  

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(value.toLowerCase()) ||
        project.company_name.toLowerCase().includes(value.toLowerCase()) ||
        project.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Handle modal visibility
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  // Handle project creation
  const handleCreate = async (values) => {
    try {
      // Find the company name by the selected company_id
      const companyName = companies.find((c) => c.id === values.company_id)?.name;

      const response = await fetch('http://127.0.0.1:8080/createProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, company: companyName }), // Send the company name instead of company_id
      });

      if (response.ok) {
        notification.success({ message: 'Project created successfully' });
        form.resetFields();
        setIsModalOpen(false);
        const newProject = await response.json();
        setProjects((prev) => [...prev, newProject]);
        setFilteredData((prev) => [...prev, newProject]);
      } else {
        throw new Error('Failed to create project');
      }
    } catch (err) {
      notification.error({ message: 'Error', description: err.message });
    }
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Company Name',
      dataIndex: 'company',
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
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
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
          <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
            <Input
              placeholder="Search project name, company name, etc."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={handleSearch}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Add Project
            </Button>
          </Space>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => navigate(`/project/${record.id}`, { state: { project: record } }),
            })}
          />
        </Content>
      </Layout>

      <Modal
        title="Add New Project"
        visible={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter the project name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: 'Please select a start date' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="End Date"
            rules={[{ required: true, message: 'Please select an end date' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="company_id"
            label="Company"
            rules={[{ required: true, message: 'Please select a company' }]}
          >
            <Select>
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProjectList;
