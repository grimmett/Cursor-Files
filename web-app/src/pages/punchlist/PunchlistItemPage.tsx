import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dataService, PunchlistItem } from '../../services/dataService';
import PhotoUpload from '../../components/PhotoUpload';

const PunchlistItemPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<PunchlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PunchlistItem>>({});
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (id === 'new') {
          // Creating new task
          setTask(null);
          setEditing(true);
          setEditForm({
            title: '',
            description: '',
            location: '',
            assignedTo: '',
            status: 'Draft',
            trade: 'General',
            value: 0
          });
        } else if (id) {
          const taskData = dataService.getTaskById(id);
          if (taskData) {
            setTask(taskData);
            setEditForm(taskData);
            
            // Fetch photos for this task
            fetchPhotos(id);
          } else {
            console.error('Task not found');
            navigate('/punchlist');
          }
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const fetchPhotos = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/task/${taskId}`);
      const result = await response.json();
      
      if (result.success) {
        setPhotos(result.data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleSave = async () => {
    try {
      // In real app, this would call API
      console.log('Saving task:', editForm);
      
      if (id === 'new') {
        // Create new task logic
        alert('New task created! (This would save to database in real app)');
        navigate('/punchlist');
      } else {
        // Update existing task logic
        alert('Task updated! (This would save to database in real app)');
        setEditing(false);
        if (task) {
          setTask({ ...task, ...editForm });
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setEditForm({ ...editForm, status: newStatus as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#f59e0b';
      case 'Closed': return '#10b981';
      case 'Pending Approval': return '#3b82f6';
      case 'Draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading task...</h1>
      </div>
    );
  }

  const isNewTask = id === 'new';
  const currentTask = task || editForm;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => navigate('/punchlist')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                marginRight: '1rem',
                color: '#6b7280'
              }}
            >
              ← Back
            </button>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>
              {isNewTask ? 'New Task' : `Task #${currentTask.taskNumber}`}
            </span>
          </div>
          
          {!isNewTask && (
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              backgroundColor: `${getStatusColor(currentTask.status || '')}20`,
              color: getStatusColor(currentTask.status || ''),
              border: `2px solid ${getStatusColor(currentTask.status || '')}40`
            }}>
              {currentTask.status}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Main Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {/* Task Details */}
          <div style={{ padding: '2rem' }}>
            {editing ? (
              // Edit Form
              <div style={{ space: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter task title..."
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Enter task description..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Location *
                    </label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                      placeholder="e.g., FLOOR 10 > UNIT 1001"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Trade
                    </label>
                    <select
                      value={editForm.trade || 'General'}
                      onChange={(e) => setEditForm({ ...editForm, trade: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="General">General</option>
                      <option value="Painting">Painting</option>
                      <option value="Glazing">Glazing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Flooring">Flooring</option>
                      <option value="Doors">Doors</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Status
                    </label>
                    <select
                      value={editForm.status || 'Draft'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Open">Open</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Value ($)
                    </label>
                    <input
                      type="number"
                      value={editForm.value || ''}
                      onChange={(e) => setEditForm({ ...editForm, value: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={editForm.assignedTo || ''}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="Contractor or company name..."
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  {currentTask.title}
                </h1>

                {currentTask.description && (
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    {currentTask.description}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Task Details</h3>
                    <div style={{ space: '0.75rem' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Location:</span>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.location}</p>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Trade:</span>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.trade}</p>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Assigned To:</span>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.assignedTo}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>Timeline</h3>
                    <div style={{ space: '0.75rem' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Created:</span>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.createdDate}</p>
                      </div>
                      {currentTask.completedDate && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Completed:</span>
                          <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.completedDate}</p>
                        </div>
                      )}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Last Modified:</span>
                        <p style={{ fontWeight: '600', color: '#1f2937', margin: '0.25rem 0' }}>{currentTask.lastModifiedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {currentTask.value && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Task Value:</span>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>
                      ${currentTask.value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '1.5rem 2rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {editing ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {isNewTask ? 'Create Task' : 'Save Changes'}
                </button>
                {!isNewTask && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditForm(task || {});
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit Task
                </button>
                
                {currentTask.status === 'Open' && (
                  <button
                    onClick={() => {
                      setEditForm({ ...editForm, status: 'Pending Approval' });
                      handleSave();
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Mark Complete
                  </button>
                )}
                
                {currentTask.status === 'Pending Approval' && (
                  <button
                    onClick={() => {
                      setEditForm({ ...editForm, status: 'Closed' });
                      handleSave();
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                )}
              </div>
            )}
            
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {!isNewTask && `Task ID: ${currentTask.taskNumber}`}
            </div>
          </div>
        </div>

        {/* Photos Section */}
        {!isNewTask && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            marginTop: '2rem',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Photos & Documents
            </h2>
            
            <PhotoUpload
              taskId={id}
              photos={photos}
              onPhotosChange={setPhotos}
            />
          </div>
        )}

        {/* Comments Section (placeholder) */}
        {!isNewTask && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            marginTop: '2rem',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Comments & Notes
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                placeholder="Add a comment or note..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              <button
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Comment functionality coming soon!')}
              >
                Add Comment
              </button>
            </div>

            <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              <p>No comments yet. Be the first to add a note!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PunchlistItemPage;
