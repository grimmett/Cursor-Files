import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/photos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory:', uploadDir);
    }
    
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `photo-${uniqueSuffix}${extension}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Mock photo storage (in real app, this would be in database)
let photos: any[] = [];
let photoIdCounter = 1;

// Upload single photo
router.post('/upload', upload.single('photo'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { taskId, caption } = req.body;

    // Create photo record
    const photo = {
      id: (photoIdCounter++).toString(),
      taskId: taskId || null,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/api/photos/serve/${req.file.filename}`,
      thumbnailUrl: `/api/photos/serve/${req.file.filename}`,
      caption: caption || '',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Demo User' // In real app, get from auth token
    };

    photos.push(photo);

    console.log('Photo uploaded:', photo);

    res.json({
      success: true,
      data: photo,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

// Upload multiple photos
router.post('/upload-multiple', upload.array('photos', 10), (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const { taskId } = req.body;
    const uploadedPhotos = [];

    for (const file of req.files) {
      const photo = {
        id: (photoIdCounter++).toString(),
        taskId: taskId || null,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/photos/serve/${file.filename}`,
        thumbnailUrl: `/api/photos/serve/${file.filename}`,
        caption: '',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Demo User'
      };

      photos.push(photo);
      uploadedPhotos.push(photo);
    }

    res.json({
      success: true,
      data: uploadedPhotos,
      message: `${uploadedPhotos.length} photos uploaded successfully`
    });

  } catch (error) {
    console.error('Multiple photo upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photos'
    });
  }
});

// Serve photos with proper CORS and content headers
router.get('/serve/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/photos', filename);
    
    console.log('Serving file:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({
        success: false,
        error: 'Photo not found',
        path: filePath
      });
    }

    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Set proper content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Serve the file
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Photo serve error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve photo'
    });
  }
});

// Get photos for a task
router.get('/task/:taskId', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const taskPhotos = photos.filter(photo => photo.taskId === taskId);
    
    res.json({
      success: true,
      data: taskPhotos
    });

  } catch (error) {
    console.error('Get task photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get photos'
    });
  }
});

// Get all photos
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get photos'
    });
  }
});

// Delete photo
router.delete('/:photoId', (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const photoIndex = photos.findIndex(photo => photo.id === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    const photo = photos[photoIndex];
    const filePath = path.join(__dirname, '../../uploads/photos', photo.filename);
    
    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from memory
    photos.splice(photoIndex, 1);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo'
    });
  }
});

// Update photo caption
router.put('/:photoId', (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { caption } = req.body;
    
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    photo.caption = caption || '';

    res.json({
      success: true,
      data: photo,
      message: 'Photo updated successfully'
    });

  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update photo'
    });
  }
});

export default router;