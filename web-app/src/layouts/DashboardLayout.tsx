import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  console.log('DashboardLayout rendering...');
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{
        background: '#1f2937',
        color: 'white',
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Bridgit Construction</h1>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;