import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, PunchlistItem } from '../../services/dataService';

const PunchlistPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<PunchlistItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<PunchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const allTasks = dataService.getTasksByStatus();
        setTasks(allTasks);
        setFilteredTasks(allTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskNumber.toString().includes(searchQuery) ||
        (task.assignedTo || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by trade
    if (tradeFilter !== 'all') {
      filtered = filtered.filter(task => task.trade === tradeFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, tradeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#f59e0b';
      case 'Closed': return '#10b981';
      case 'Pending Approval': return '#3b82f6';
      case 'Draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return '⭕';
      case 'Closed': return '✅';
      case 'Pending Approval': return '🔵';
      case 'Draft': return '📝';
      default: return '⭕';
    }
  };

  const statusCounts = {
    all: tasks.length,
    Open: tasks.filter(t => t.status === 'Open').length,
    'Pending Approval': tasks.filter(t => t.status === 'Pending Approval').length,
    Closed: tasks.filter(t => t.status === 'Closed').length,
    Draft: tasks.filter(t => t.status === 'Draft').length,
  };

  const trades = ['all', ...Array.from(new Set(tasks.map(t => t.trade).filter(Boolean)))];

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading punchlist...</h1>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            The Pacific - Punchlist Tasks
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Search */}
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search tasks by title, location, task #, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All ({statusCounts.all})</option>
                <option value="Open">Open ({statusCounts.Open})</option>
                <option value="Pending Approval">Pending ({statusCounts['Pending Approval']})</option>
                <option value="Closed">Closed ({statusCounts.Closed})</option>
                <option value="Draft">Draft ({statusCounts.Draft})</option>
              </select>
            </div>

            {/* Trade Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Trade
              </label>
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}
              >
                {trades.map(trade => (
                  <option key={trade} value={trade}>
                    {trade === 'all' ? 'All Trades' : trade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                No tasks found matching your filters
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                onClick={() => navigate(`/punchlist/${task.id}`)}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < filteredTasks.length - 1 ? '1px solid #e5e7eb' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': { backgroundColor: '#f8fafc' }
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Task Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                        {getStatusIcon(task.status)}
                      </span>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                        marginRight: '1rem'
                      }}>
                        #{task.taskNumber} - {task.title}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: `${getStatusColor(task.status)}20`,
                        color: getStatusColor(task.status),
                        border: `1px solid ${getStatusColor(task.status)}40`
                      }}>
                        {task.status}
                      </span>
                    </div>

                    {/* Task Details */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        📍 {task.location}
                      </p>
                      {task.trade && (
                        <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.95rem' }}>
                          🔧 {task.trade}
                        </p>
                      )}
                      <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.95rem' }}>
                        👤 {task.assignedTo?.split(':')[0] || 'Unassigned'}
                      </p>
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                      <span>Created: {task.createdDate}</span>
                      {task.completedDate && (
                        <span>Completed: {task.completedDate}</span>
                      )}
                      <span>Modified: {task.lastModifiedDate}</span>
                    </div>
                  </div>

                  {/* Value */}
                  {task.value && (
                    <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        ${task.value}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                        Value
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => navigate('/punchlist/new')}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PunchlistPage;
