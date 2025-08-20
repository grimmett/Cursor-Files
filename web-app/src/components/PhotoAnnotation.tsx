import React, { useState, useRef, useEffect } from 'react';

interface Annotation {
  id: string;
  type: 'circle' | 'text' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  annotations?: Annotation[];
}

interface PhotoAnnotationProps {
  photo: Photo;
  onUpdate: (photo: Photo) => void;
  onDelete: (photoId: string) => void;
}

const PhotoAnnotation: React.FC<PhotoAnnotationProps> = ({ photo, onUpdate, onDelete }) => {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'circle' | 'text' | 'arrow'>('circle');
  const [annotations, setAnnotations] = useState<Annotation[]>(photo.annotations || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [showFullsize, setShowFullsize] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawAnnotations();
    }
  }, [annotations, imageLoaded]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image display size
    const rect = image.getBoundingClientRect();
    canvas.width = image.offsetWidth;
    canvas.height = image.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = 3;

      switch (annotation.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(annotation.x, annotation.y, 30, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        
        case 'text':
          ctx.font = '16px Arial';
          ctx.fillText(annotation.text || 'Text', annotation.x, annotation.y);
          break;
        
        case 'arrow':
          // Simple arrow drawing
          ctx.beginPath();
          ctx.moveTo(annotation.x, annotation.y);
          ctx.lineTo(annotation.x + (annotation.width || 50), annotation.y + (annotation.height || 50));
          ctx.stroke();
          
          // Arrow head
          const headLength = 15;
          const angle = Math.atan2(annotation.height || 50, annotation.width || 50);
          ctx.beginPath();
          ctx.moveTo(annotation.x + (annotation.width || 50), annotation.y + (annotation.height || 50));
          ctx.lineTo(
            annotation.x + (annotation.width || 50) - headLength * Math.cos(angle - Math.PI / 6),
            annotation.y + (annotation.height || 50) - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(annotation.x + (annotation.width || 50), annotation.y + (annotation.height || 50));
          ctx.lineTo(
            annotation.x + (annotation.width || 50) - headLength * Math.cos(angle + Math.PI / 6),
            annotation.y + (annotation.height || 50) - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      color: selectedColor,
      width: selectedTool === 'arrow' ? 50 : undefined,
      height: selectedTool === 'arrow' ? 50 : undefined,
      text: selectedTool === 'text' ? prompt('Enter text:') || 'Text' : undefined,
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    
    // Update photo with annotations
    const updatedPhoto = { ...photo, annotations: updatedAnnotations };
    onUpdate(updatedPhoto);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    const updatedPhoto = { ...photo, annotations: [] };
    onUpdate(updatedPhoto);
  };

  const updateCaption = (caption: string) => {
    const updatedPhoto = { ...photo, caption };
    onUpdate(updatedPhoto);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const photoUrl = `http://localhost:3001${photo.url}`;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Photo Container */}
      <div style={{ position: 'relative' }}>
        {imageError ? (
          <div style={{
            aspectRatio: '4/3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <p>Failed to load image</p>
              <p style={{ fontSize: '0.8rem' }}>{photoUrl}</p>
            </div>
          </div>
        ) : (
          <>
            <img
              ref={imageRef}
              src={photoUrl}
              alt={photo.caption || photo.originalName}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Image load error:', e);
                console.error('Attempted URL:', photoUrl);
                setImageError(true);
              }}
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '4/3',
                objectFit: 'cover',
                display: imageError ? 'none' : 'block'
              }}
              onClick={() => setShowFullsize(true)}
            />
            
            {/* Annotation Canvas */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: isAnnotating ? 'crosshair' : 'pointer',
                pointerEvents: isAnnotating ? 'auto' : 'none'
              }}
            />
          </>
        )}

        {/* Annotation Tools */}
        {isAnnotating && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Tool Selection */}
            <button
              onClick={() => setSelectedTool('circle')}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: selectedTool === 'circle' ? '#2563eb' : 'transparent',
                color: selectedTool === 'circle' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ⭕ Circle
            </button>
            
            <button
              onClick={() => setSelectedTool('text')}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: selectedTool === 'text' ? '#2563eb' : 'transparent',
                color: selectedTool === 'text' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              📝 Text
            </button>
            
            <button
              onClick={() => setSelectedTool('arrow')}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: selectedTool === 'arrow' ? '#2563eb' : 'transparent',
                color: selectedTool === 'arrow' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ➡️ Arrow
            </button>

            {/* Color Selection */}
            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            {/* Clear Annotations */}
            {annotations.length > 0 && (
              <button
                onClick={clearAnnotations}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setIsAnnotating(!isAnnotating)}
            style={{
              backgroundColor: isAnnotating ? '#10b981' : 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            {isAnnotating ? '✓ Done' : '✏️ Annotate'}
          </button>
          
          <button
            onClick={() => onDelete(photo.id)}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Photo Info */}
      <div style={{ padding: '1rem' }}>
        <input
          type="text"
          placeholder="Add a caption..."
          value={photo.caption}
          onChange={(e) => updateCaption(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginBottom: '0.75rem'
          }}
        />
        
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>{photo.originalName}</strong>
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Size: {formatFileSize(photo.size)}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
          </div>
          {annotations.length > 0 && (
            <div style={{ color: '#2563eb' }}>
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Fullsize Modal */}
      {showFullsize && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowFullsize(false)}
        >
          <img
            src={photoUrl}
            alt={photo.caption || photo.originalName}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
          <button
            onClick={() => setShowFullsize(false)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoAnnotation;