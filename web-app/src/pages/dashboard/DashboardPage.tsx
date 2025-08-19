import React from 'react';

const DashboardPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
      Construction Dashboard
    </h1>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1rem',
      marginTop: '2rem'
    }}>
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Tasks</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>870</p>
      </div>
      
      <div style={{
        backgroundColor: '#10b981',
        color: 'white', 
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Completed</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>966</p>
      </div>
      
      <div style={{
        backgroundColor: '#06b6d4',
        color: 'white',
        padding: '2rem', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Projects</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</p>
      </div>
    </div>
    
    <p style={{ marginTop: '2rem', color: '#6b7280' }}>
      Welcome to your Bridgit-inspired construction punchlist dashboard!
    </p>
  </div>
);

export default DashboardPage;
