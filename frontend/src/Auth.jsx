import React from 'react';

export default function Auth() {
  const loginAdmin = async () => {
    const response = await fetch('http://127.0.0.1:8080/loginAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'test_password'
      })
    });
  
    const data = await response.json();
  
    if (response.ok) {
      const userId = data.user['id']; // Access user ID here
      sessionStorage.setItem('userId', userId);
      window.location.href = '/dashboard'; // Redirect
    } else {
      console.error(data.error);
    }
  };
  

  const loginClient = async () => {
    const response = await fetch('http://127.0.0.1:8080/loginClient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'new_user',
        email: 'new_user@example.com',
        password: 'new_password'
      })
    });
    const data = await response.json();
    if (response.ok) {
      const userId = data.user['id']; // Access user ID here
      sessionStorage.setItem('userId', userId);
      window.location.href = '/dashboard'; // Redirect
    } else {
      console.error(data.error);
    }
  };

  return (
    <>
      <h1>Auth</h1>
      <button onClick={loginClient}>Login Client</button>
      <button onClick={loginAdmin}>Login Admin</button>
    </>
  );
}
