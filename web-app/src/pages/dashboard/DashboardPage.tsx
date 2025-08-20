import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';

interface DashboardMetrics {
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  draftTasks: number;
  completionPercentage: number;
  totalValue: number;
  completedValue: number;
  trades: Record<string, number>;
  recentActivity: any[];
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real app this would fetch from backend
    const fetchData = async () => {
      try {
        const dashboardData = dataService.getDashboardMetrics();
        setMetrics(dashboardData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error loading dashboard data</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            The Pacific - Owner's Deficiencies
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Construction Punchlist Dashboard • {metrics.completionPercentage}% Complete
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/punchlist')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            View All Tasks
          </button>
          
          <button
            onClick={() => navigate('/punchlist/new')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Tasks */}
        <div 
          onClick={() => navigate('/punchlist')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Total Tasks</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{metrics.totalTasks}</p>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            All punchlist items
          </p>
        </div>
        
        {/* Open Tasks */}
        <div 
          onClick={() => navigate('/punchlist')}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Open Tasks</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{metrics.openTasks}</p>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            Awaiting completion
          </p>
        </div>
        
        {/* Completed Tasks */}
        <div 
          onClick={() => navigate('/punchlist')}
          style={{
            backgroundColor: '#10b981',
            color: 'white', 
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Completed</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{metrics.completedTasks}</p>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            Closed & approved
          </p>
        </div>
        
        {/* Draft Tasks */}
        <div 
          onClick={() => navigate('/punchlist')}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '2rem', 
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(107, 114, 128, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Draft</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>{metrics.draftTasks}</p>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            In preparation
          </p>
        </div>
      </div>

      {/* Value Summary */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Project Value Summary
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Total Value</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>
              ${metrics.totalValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Completed Value</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981', margin: '0.25rem 0' }}>
              ${metrics.completedValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Completion Rate</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb', margin: '0.25rem 0' }}>
              {metrics.completionPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Trade Breakdown */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Tasks by Trade
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {Object.entries(metrics.trades)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([trade, count]) => (
            <div key={trade} style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {count}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                {trade}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Recent Activity
        </h2>
        <div style={{ space: '1rem' }}>
          {metrics.recentActivity.map((task, index) => (
            <div key={task.id} style={{
              padding: '1rem',
              borderBottom: index < metrics.recentActivity.length - 1 ? '1px solid #e5e7eb' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  #{task.taskNumber} - {task.title}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  {task.location} • Modified by {task.lastModifiedBy}
                </p>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                backgroundColor: task.status === 'Closed' ? '#dcfce7' : 
                               task.status === 'Open' ? '#fef3c7' :
                               task.status === 'Pending Approval' ? '#dbeafe' : '#f3f4f6',
                color: task.status === 'Closed' ? '#166534' :
                       task.status === 'Open' ? '#92400e' :
                       task.status === 'Pending Approval' ? '#1e40af' : '#374151'
              }}>
                {task.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
