import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../stores/offlineStore';
import { Project, PunchlistItem, Photo, User } from '../../../shared/types';
import OfflinePhotoService from './offlinePhotoService';

export interface SyncProgress {
  current: number;
  total: number;
  stage: 'projects' | 'punchlist' | 'photos' | 'users' | 'complete';
  message: string;
}

export interface SyncResult {
  success: boolean;
  projectsDownloaded: number;
  punchlistItemsDownloaded: number;
  photosDownloaded: number;
  usersDownloaded: number;
  errors: string[];
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  entity: 'project' | 'punchlist_item' | 'photo' | 'user';
  localId: string;
  remoteId: string;
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'manual';
}

export class DataSyncService {
  private static instance: DataSyncService;
  private isSyncing: boolean = false;
  private syncProgressCallback?: (progress: SyncProgress) => void;
  
  private constructor() {}
  
  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }
  
  /**
   * Check network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  }
  
  /**
   * Download all project data for offline use
   */
  async downloadProjectData(
    projectIds: string[],
    progressCallback?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }
    
    this.isSyncing = true;
    this.syncProgressCallback = progressCallback;
    
    try {
      const result: SyncResult = {
        success: true,
        projectsDownloaded: 0,
        punchlistItemsDownloaded: 0,
        photosDownloaded: 0,
        usersDownloaded: 0,
        errors: [],
        conflicts: []
      };
      
      // Download projects
      await this.updateProgress('projects', 0, projectIds.length, 'Downloading projects...');
      for (let i = 0; i < projectIds.length; i++) {
        try {
          await this.downloadProject(projectIds[i]);
          result.projectsDownloaded++;
          await this.updateProgress('projects', i + 1, projectIds.length, `Downloaded project ${i + 1}/${projectIds.length}`);
        } catch (error) {
          result.errors.push(`Failed to download project ${projectIds[i]}: ${error}`);
        }
      }
      
      // Download punchlist items for all projects
      const offlineStore = useOfflineStore.getState();
      const allProjects = offlineStore.projects.filter(p => projectIds.includes(p.id));
      const totalItems = allProjects.reduce((sum, project) => sum + (project.totalItems || 0), 0);
      
      await this.updateProgress('punchlist', 0, totalItems, 'Downloading punchlist items...');
      let itemsDownloaded = 0;
      
      for (const project of allProjects) {
        try {
          const items = await this.downloadPunchlistItems(project.id);
          result.punchlistItemsDownloaded += items.length;
          itemsDownloaded += items.length;
          await this.updateProgress('punchlist', itemsDownloaded, totalItems, `Downloaded ${itemsDownloaded}/${totalItems} items`);
        } catch (error) {
          result.errors.push(`Failed to download punchlist items for project ${project.id}: ${error}`);
        }
      }
      
      // Download photos for all punchlist items
      const allItems = offlineStore.punchlistItems.filter(item => 
        projectIds.includes(item.projectId)
      );
      const totalPhotos = allItems.reduce((sum, item) => sum + (item.photos?.length || 0), 0);
      
      await this.updateProgress('photos', 0, totalPhotos, 'Downloading photos...');
      let photosDownloaded = 0;
      
      for (const item of allItems) {
        try {
          const photos = await this.downloadPhotos(item.id);
          result.photosDownloaded += photos.length;
          photosDownloaded += photos.length;
          await this.updateProgress('photos', photosDownloaded, totalPhotos, `Downloaded ${photosDownloaded}/${totalPhotos} photos`);
        } catch (error) {
          result.errors.push(`Failed to download photos for item ${item.id}: ${error}`);
        }
      }
      
      // Download users
      await this.updateProgress('users', 0, 1, 'Downloading user data...');
      try {
        await this.downloadUsers();
        result.usersDownloaded = offlineStore.users.length;
        await this.updateProgress('users', 1, 1, 'User data downloaded');
      } catch (error) {
        result.errors.push(`Failed to download users: ${error}`);
      }
      
      await this.updateProgress('complete', 1, 1, 'Sync complete!');
      
      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
      return result;
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Download a single project
   */
  private async downloadProject(projectId: string): Promise<Project> {
    try {
      // This would be an actual API call
      // const project = await apiClient.getProject(projectId);
      const project: Project = {
        id: projectId,
        name: 'Sample Project',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        clientName: 'Sample Client',
        startDate: new Date(),
        status: 'in_progress',
        createdBy: 'user1',
        assignedUsers: ['user1'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const offlineStore = useOfflineStore.getState();
      offlineStore.cacheProject(project);
      
      return project;
    } catch (error) {
      console.error(`Error downloading project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Download punchlist items for a project
   */
  private async downloadPunchlistItems(projectId: string): Promise<PunchlistItem[]> {
    try {
      // This would be an actual API call
      // const items = await apiClient.getPunchlistItems(projectId);
      const items: PunchlistItem[] = [
        {
          id: `item_${projectId}_1`,
          projectId,
          title: 'Sample Item 1',
          description: 'This is a sample punchlist item',
          location: 'Room 101',
          trade: 'electrical',
          priority: 'medium',
          status: 'open',
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          photos: [],
          notes: []
        }
      ];
      
      const offlineStore = useOfflineStore.getState();
      items.forEach(item => offlineStore.cachePunchlistItem(item));
      
      return items;
    } catch (error) {
      console.error(`Error downloading punchlist items for project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Download photos for a punchlist item
   */
  private async downloadPhotos(itemId: string): Promise<Photo[]> {
    try {
      // This would be an actual API call
      // const photos = await apiClient.getPhotos(itemId);
      const photos: Photo[] = [];
      
      const offlineStore = useOfflineStore.getState();
      photos.forEach(photo => offlineStore.cachePhoto(photo));
      
      return photos;
    } catch (error) {
      console.error(`Error downloading photos for item ${itemId}:`, error);
      throw error;
    }
  }
  
  /**
   * Download user data
   */
  private async downloadUsers(): Promise<User[]> {
    try {
      // This would be an actual API call
      // const users = await apiClient.getUsers();
      const users: User[] = [
        {
          id: 'user1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'inspector',
          company: 'Sample Company',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const offlineStore = useOfflineStore.getState();
      users.forEach(user => offlineStore.cacheUser(user));
      
      return users;
    } catch (error) {
      console.error('Error downloading users:', error);
      throw error;
    }
  }
  
  /**
   * Upload offline changes to server
   */
  async uploadOfflineChanges(): Promise<{
    success: boolean;
    uploaded: number;
    errors: string[];
  }> {
    try {
      const offlineStore = useOfflineStore.getState();
      const pendingChanges = offlineStore.getPendingChanges();
      
      if (pendingChanges.length === 0) {
        return { success: true, uploaded: 0, errors: [] };
      }
      
      let uploaded = 0;
      const errors: string[] = [];
      
      for (const change of pendingChanges) {
        try {
          await this.uploadChange(change);
          uploaded++;
        } catch (error) {
          errors.push(`Failed to upload ${change.entity} ${change.id}: ${error}`);
        }
      }
      
      return { success: errors.length === 0, uploaded, errors };
    } catch (error) {
      console.error('Error uploading offline changes:', error);
      return { success: false, uploaded: 0, errors: [`Upload failed: ${error}`] };
    }
  }
  
  /**
   * Upload a single change
   */
  private async uploadChange(change: any): Promise<void> {
    // This would be an actual API call
    switch (change.type) {
      case 'CREATE':
        // await apiClient.create(change.entity, change.data);
        break;
      case 'UPDATE':
        // await apiClient.update(change.entity, change.data.id, change.data);
        break;
      case 'DELETE':
        // await apiClient.delete(change.entity, change.data.id);
        break;
    }
  }
  
  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      try {
        switch (conflict.resolution) {
          case 'local':
            // Keep local version, mark for upload
            break;
          case 'remote':
            // Update local with remote version
            break;
          case 'manual':
            // User needs to manually resolve
            break;
        }
      } catch (error) {
        console.error(`Error resolving conflict for ${conflict.entity} ${conflict.localId}:`, error);
      }
    }
  }
  
  /**
   * Update sync progress
   */
  private async updateProgress(
    stage: SyncProgress['stage'],
    current: number,
    total: number,
    message: string
  ): Promise<void> {
    if (this.syncProgressCallback) {
      this.syncProgressCallback({
        current,
        total,
        stage,
        message
      });
    }
    
    // Add small delay to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(): { isSyncing: boolean; lastSync: Date | null } {
    const offlineStore = useOfflineStore.getState();
    return {
      isSyncing: this.isSyncing,
      lastSync: offlineStore.lastSyncTime
    };
  }
  
  /**
   * Cancel ongoing sync
   */
  cancelSync(): void {
    this.isSyncing = false;
  }
  
  /**
   * Clean up old offline data
   */
  async cleanupOldData(maxAgeDays: number = 90): Promise<{
    projectsRemoved: number;
    itemsRemoved: number;
    photosRemoved: number;
  }> {
    try {
      const offlineStore = useOfflineStore.getState();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
      let projectsRemoved = 0;
      let itemsRemoved = 0;
      let photosRemoved = 0;
      
      // Clean up old projects
      const oldProjects = offlineStore.projects.filter(p => p.updatedAt < cutoffDate);
      projectsRemoved = oldProjects.length;
      
      // Clean up old punchlist items
      const oldItems = offlineStore.punchlistItems.filter(i => i.updatedAt < cutoffDate);
      itemsRemoved = oldItems.length;
      
      // Clean up old photos
      const photoService = OfflinePhotoService.getInstance();
      photosRemoved = await photoService.cleanupOldPhotos(maxAgeDays);
      
      return {
        projectsRemoved,
        itemsRemoved,
        photosRemoved
      };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return { projectsRemoved: 0, itemsRemoved: 0, photosRemoved: 0 };
    }
  }
}

export default DataSyncService;



