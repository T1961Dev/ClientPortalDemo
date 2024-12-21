import axios from 'axios';

// Set base URL for the API
const api = axios.create({
  baseURL: 'http://localhost:8080', // replace with your actual backend URL
});

// API request for fetching users by company
export const fetchUsersByCompany = (companyName) => {
  return api.get(`/getUsersByCompany?company_name=${companyName}`);
};

// API request for fetching a single user's details
export const fetchUserDetails = (userId) => {
  return api.get(`/getUser?user_id=${userId}`);
};
