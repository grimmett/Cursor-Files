import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { Photo } from '../../../shared/types';
import { useOfflineStore } from '../stores/offlineStore';

export interface OfflinePhotoData {
  id: string;
  uri: string;
  thumbnailUri: string;
  caption?: string;
  location?: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
    timestamp: Date;
  };
  punchlistItemId: string;
  projectId: string;
  uploadedBy: string;
}

export class OfflinePhotoService {
  private static instance: OfflinePhotoService;
  private photoDirectory: string;
  private thumbnailDirectory: string;
  
  private constructor() {
    this.photoDirectory = `${FileSystem.documentDirectory}photos/`;
    this.thumbnailDirectory = `${FileSystem.documentDirectory}thumbnails/`;
    this.ensureDirectories();
  }
  
  static getInstance(): OfflinePhotoService {
    if (!OfflinePhotoService.instance) {
      OfflinePhotoService.instance = new OfflinePhotoService();
    }
    return OfflinePhotoService.instance;
  }
  
  private async ensureDirectories(): Promise<void> {
    try {
      await FileSystem.makeDirectoryAsync(this.photoDirectory, { intermediates: true });
      await FileSystem.makeDirectoryAsync(this.thumbnailDirectory, { intermediates: true });
    } catch (error) {
      console.log('Directories already exist or cannot be created');
    }
  }
  
  /**
   * Capture and store a photo offline
   */
  async captureAndStorePhoto(
    imageUri: string,
    punchlistItemId: string,
    projectId: string,
    uploadedBy: string,
    caption?: string,
    location?: string
  ): Promise<OfflinePhotoData> {
    try {
      // Generate unique ID for offline photo
      const photoId = `offline_photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get image metadata
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );
      
      // Create thumbnail
      const thumbnail = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 300, height: 300 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.6 }
      );
      
      // Generate file paths
      const photoFileName = `${photoId}.jpg`;
      const thumbnailFileName = `${photoId}_thumb.jpg`;
      const photoPath = `${this.photoDirectory}${photoFileName}`;
      const thumbnailPath = `${this.thumbnailDirectory}${thumbnailFileName}`;
      
      // Copy original photo to app directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: photoPath
      });
      
      // Save thumbnail
      await FileSystem.copyAsync({
        from: thumbnail.uri,
        to: thumbnailPath
      });
      
      // Get file size
      const photoInfo = await FileSystem.getInfoAsync(photoPath);
      
      // Create photo data object
      const photoData: OfflinePhotoData = {
        id: photoId,
        uri: photoPath,
        thumbnailUri: thumbnailPath,
        caption,
        location,
        metadata: {
          width: imageInfo.width,
          height: imageInfo.height,
          size: photoInfo.size || 0,
          format: 'JPEG',
          timestamp: new Date()
        },
        punchlistItemId,
        projectId,
        uploadedBy
      };
      
      // Store in offline store
      const offlineStore = useOfflineStore.getState();
      await offlineStore.createOfflinePhoto({
        id: photoId,
        url: photoPath,
        thumbnailUrl: thumbnailPath,
        caption,
        takenAt: new Date(),
        uploadedBy,
        uploadedAt: new Date()
      });
      
      // Save to device media library if permission granted
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(photoPath);
        }
      } catch (error) {
        console.log('Could not save to media library:', error);
      }
      
      return photoData;
    } catch (error) {
      console.error('Error capturing and storing photo:', error);
      throw new Error('Failed to capture and store photo');
    }
  }
  
  /**
   * Get all offline photos for a punchlist item
   */
  async getOfflinePhotos(itemId: string): Promise<OfflinePhotoData[]> {
    try {
      const offlineStore = useOfflineStore.getState();
      const photos = offlineStore.getOfflinePhotos(itemId);
      
      // Filter photos that actually exist on disk
      const existingPhotos: OfflinePhotoData[] = [];
      
      for (const photo of photos) {
        const photoExists = await FileSystem.getInfoAsync(photo.url);
        const thumbnailExists = await FileSystem.getInfoAsync(photo.thumbnailUrl);
        
        if (photoExists.exists && thumbnailExists.exists) {
          existingPhotos.push({
            id: photo.id,
            uri: photo.url,
            thumbnailUri: photo.thumbnailUrl,
            caption: photo.caption,
            metadata: {
              width: 0, // Would need to extract from EXIF or store separately
              height: 0,
              size: photoExists.size || 0,
              format: 'JPEG',
              timestamp: photo.takenAt
            },
            punchlistItemId: itemId,
            projectId: '', // Would need to get from punchlist item
            uploadedBy: photo.uploadedBy
          });
        }
      }
      
      return existingPhotos;
    } catch (error) {
      console.error('Error getting offline photos:', error);
      return [];
    }
  }
  
  /**
   * Update photo metadata (caption, location, etc.)
   */
  async updatePhotoMetadata(
    photoId: string,
    updates: Partial<Pick<OfflinePhotoData, 'caption' | 'location'>>
  ): Promise<void> {
    try {
      const offlineStore = useOfflineStore.getState();
      offlineStore.updateOfflinePhoto(photoId, updates);
    } catch (error) {
      console.error('Error updating photo metadata:', error);
      throw new Error('Failed to update photo metadata');
    }
  }
  
  /**
   * Delete offline photo
   */
  async deleteOfflinePhoto(photoId: string): Promise<void> {
    try {
      const offlineStore = useOfflineStore.getState();
      const photos = offlineStore.photos;
      const photo = photos.find(p => p.id === photoId);
      
      if (photo) {
        // Delete files from disk
        try {
          await FileSystem.deleteAsync(photo.url);
          await FileSystem.deleteAsync(photo.thumbnailUrl);
        } catch (error) {
          console.log('Files may already be deleted:', error);
        }
        
        // Remove from offline store
        offlineStore.deleteOfflinePhoto(photoId);
      }
    } catch (error) {
      console.error('Error deleting offline photo:', error);
      throw new Error('Failed to delete photo');
    }
  }
  
  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalPhotos: number;
    totalSize: number;
    availableSpace: number;
  }> {
    try {
      const photoInfo = await FileSystem.getInfoAsync(this.photoDirectory);
      const thumbnailInfo = await FileSystem.getInfoAsync(this.thumbnailDirectory);
      
      // Calculate total size (this is a rough estimate)
      const totalSize = (photoInfo.size || 0) + (thumbnailInfo.size || 0);
      
      // Get available space
      const availableSpace = await this.getAvailableSpace();
      
      // Count total photos
      const offlineStore = useOfflineStore.getState();
      const totalPhotos = offlineStore.photos.length;
      
      return {
        totalPhotos,
        totalSize,
        availableSpace
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalPhotos: 0,
        totalSize: 0,
        availableSpace: 0
      };
    }
  }
  
  /**
   * Clean up old photos to free space
   */
  async cleanupOldPhotos(maxAgeDays: number = 30): Promise<number> {
    try {
      const offlineStore = useOfflineStore.getState();
      const photos = offlineStore.photos;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
      let deletedCount = 0;
      
      for (const photo of photos) {
        if (photo.takenAt < cutoffDate) {
          try {
            await this.deleteOfflinePhoto(photo.id);
            deletedCount++;
          } catch (error) {
            console.log(`Failed to delete old photo ${photo.id}:`, error);
          }
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old photos:', error);
      return 0;
    }
  }
  
  /**
   * Get available space on device
   */
  private async getAvailableSpace(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        // iOS doesn't provide direct access to available space
        // Return a reasonable default
        return 1024 * 1024 * 1024; // 1GB
      } else {
        // Android - could implement space checking
        return 1024 * 1024 * 1024; // 1GB default
      }
    } catch (error) {
      console.error('Error getting available space:', error);
      return 1024 * 1024 * 1024; // 1GB default
    }
  }
  
  /**
   * Export photos for backup
   */
  async exportPhotos(projectId: string): Promise<string> {
    try {
      const offlineStore = useOfflineStore.getState();
      const projectPhotos = offlineStore.photos.filter(photo => 
        photo.id.includes(projectId)
      );
      
      const exportData = {
        projectId,
        exportDate: new Date().toISOString(),
        photos: projectPhotos.map(photo => ({
          id: photo.id,
          caption: photo.caption,
          takenAt: photo.takenAt,
          uploadedBy: photo.uploadedBy
        }))
      };
      
      const exportPath = `${FileSystem.documentDirectory}exports/project_${projectId}_${Date.now()}.json`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}exports/`, { intermediates: true });
      await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(exportData, null, 2));
      
      return exportPath;
    } catch (error) {
      console.error('Error exporting photos:', error);
      throw new Error('Failed to export photos');
    }
  }
}

export default OfflinePhotoService;




