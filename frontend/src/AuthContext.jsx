import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = sessionStorage.getItem('userId'); // Get user ID from sessionStorage
      if (!userId) return;

      try {
        const response = await fetch(`http://127.0.0.1:8080/getUser?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data); // Set user data (includes role)
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
