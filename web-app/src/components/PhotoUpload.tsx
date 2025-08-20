import React, { useState, useRef } from 'react';
import PhotoAnnotation from './PhotoAnnotation';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  originalName: string;
  size: number;
  uploadedAt: string;
}

interface PhotoUploadProps {
  taskId?: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ taskId, photos, onPhotosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhotos = async (files: FileList) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Add files to FormData
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });
      
      if (taskId) {
        formData.append('taskId', taskId);
      }

      const response = await fetch('http://localhost:3001/api/photos/upload-multiple', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newPhotos = [...photos, ...result.data];
        onPhotosChange(newPhotos);
        
        // Show success message
        alert(`${result.data.length} photo(s) uploaded successfully!`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadPhotos(files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadPhotos(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        const updatedPhotos = photos.filter(photo => photo.id !== photoId);
        onPhotosChange(updatedPhotos);
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const updateCaption = async (photoId: string, caption: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedPhotos = photos.map(photo => 
          photo.id === photoId ? { ...photo, caption } : photo
        );
        onPhotosChange(updatedPhotos);
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update caption error:', error);
      alert('Failed to update caption. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: dragOver ? '#eff6ff' : '#f8fafc',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '2rem'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {uploading ? '⏳' : '📷'}
        </div>
        
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            {uploading ? 'Uploading photos...' : 'Upload photos'}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {uploading 
              ? 'Please wait while your photos are being uploaded'
              : 'Click to select files or drag and drop images here'
            }
          </p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Supports: JPEG, PNG, GIF, WebP (max 10MB per file)
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Photos ({photos.length})
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {photos.map((photo) => (
              <PhotoAnnotation
                key={photo.id}
                photo={photo}
                onUpdate={(updatedPhoto) => {
                  const updatedPhotos = photos.map(p => 
                    p.id === updatedPhoto.id ? updatedPhoto : p
                  );
                  onPhotosChange(updatedPhotos);
                }}
                onDelete={deletePhoto}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {photos.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            Quick Actions
          </h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Add More Photos
            </button>
            
            <button
              onClick={() => alert('Download all photos feature coming soon!')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Download All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;