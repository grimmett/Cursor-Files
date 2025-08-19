import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Project, PunchlistItem, Photo, User } from '../../../shared/types';

interface OfflineStore {
  // Offline data storage
  projects: Project[];
  punchlistItems: PunchlistItem[];
  photos: Photo[];
  users: User[];
  
  // Sync queue for pending operations
  syncQueue: SyncOperation[];
  
  // Connection status
  isOnline: boolean;
  lastSyncTime: Date | null;
  
  // Actions
  setOnlineStatus: (status: boolean) => void;
  addToSyncQueue: (operation: SyncOperation) => void;
  processSyncQueue: () => Promise<void>;
  clearSyncQueue: () => void;
  
  // Data management
  cacheProject: (project: Project) => void;
  cachePunchlistItem: (item: PunchlistItem) => void;
  cachePhoto: (photo: Photo) => void;
  cacheUser: (user: User) => void;
  
  // Offline operations
  createOfflinePunchlistItem: (item: Omit<PunchlistItem, 'id'>) => Promise<string>;
  updateOfflinePunchlistItem: (id: string, updates: Partial<PunchlistItem>) => void;
  deleteOfflinePunchlistItem: (id: string) => void;
  
  createOfflinePhoto: (photo: Omit<Photo, 'id'>) => Promise<string>;
  updateOfflinePhoto: (id: string, updates: Partial<Photo>) => void;
  deleteOfflinePhoto: (id: string) => void;
  
  // Data retrieval
  getOfflineProject: (id: string) => Project | undefined;
  getOfflinePunchlistItems: (projectId: string) => PunchlistItem[];
  getOfflinePhotos: (itemId: string) => Photo[];
  
  // Sync status
  getPendingChanges: () => SyncOperation[];
  getSyncStatus: () => SyncStatus;
}

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'project' | 'punchlist_item' | 'photo' | 'user';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  pendingOperations: number;
  lastSyncTime: Date | null;
  isOnline: boolean;
  syncInProgress: boolean;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      punchlistItems: [],
      photos: [],
      users: [],
      syncQueue: [],
      isOnline: false,
      lastSyncTime: null,
      
      // Connection management
      setOnlineStatus: (status: boolean) => {
        set({ isOnline: status });
        if (status) {
          // Auto-sync when coming back online
          get().processSyncQueue();
        }
      },
      
      // Sync queue management
      addToSyncQueue: (operation: SyncOperation) => {
        set(state => ({
          syncQueue: [...state.syncQueue, operation]
        }));
      },
      
      clearSyncQueue: () => set({ syncQueue: [] }),
      
      processSyncQueue: async () => {
        const { syncQueue, isOnline } = get();
        if (!isOnline || syncQueue.length === 0) return;
        
        set(state => ({ syncInProgress: true }));
        
        try {
          const operations = [...syncQueue];
          const successfulOperations: string[] = [];
          
          for (const operation of operations) {
            try {
              await processSyncOperation(operation);
              successfulOperations.push(operation.id);
            } catch (error) {
              console.error(`Sync operation failed:`, operation, error);
              // Increment retry count
              if (operation.retryCount < operation.maxRetries) {
                set(state => ({
                  syncQueue: state.syncQueue.map(op => 
                    op.id === operation.id 
                      ? { ...op, retryCount: op.retryCount + 1 }
                      : op
                  )
                }));
              }
            }
          }
          
          // Remove successful operations from queue
          set(state => ({
            syncQueue: state.syncQueue.filter(op => 
              !successfulOperations.includes(op.id)
            ),
            lastSyncTime: new Date()
          }));
        } finally {
          set(state => ({ syncInProgress: false }));
        }
      },
      
      // Data caching
      cacheProject: (project: Project) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === project.id ? project : p
          ).concat(
            state.projects.find(p => p.id === project.id) ? [] : [project]
          )
        }));
      },
      
      cachePunchlistItem: (item: PunchlistItem) => {
        set(state => ({
          punchlistItems: state.punchlistItems.map(i => 
            i.id === item.id ? item : i
          ).concat(
            state.punchlistItems.find(i => i.id === item.id) ? [] : [item]
          )
        }));
      },
      
      cachePhoto: (photo: Photo) => {
        set(state => ({
          photos: state.photos.map(p => 
            p.id === photo.id ? photo : p
          ).concat(
            state.photos.find(p => p.id === photo.id) ? [] : [photo]
          )
        }));
      },
      
      cacheUser: (user: User) => {
        set(state => ({
          users: state.users.map(u => 
            u.id === user.id ? user : u
          ).concat(
            state.users.find(u => u.id === user.id) ? [] : [user]
          )
        }));
      },
      
      // Offline operations
      createOfflinePunchlistItem: async (itemData) => {
        const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const offlineItem: PunchlistItem = {
          ...itemData,
          id: offlineId,
          createdAt: new Date(),
          updatedAt: new Date(),
          photos: [],
          notes: []
        };
        
        set(state => ({
          punchlistItems: [...state.punchlistItems, offlineItem]
        }));
        
        // Add to sync queue
        get().addToSyncQueue({
          id: `sync_${offlineId}`,
          type: 'CREATE',
          entity: 'punchlist_item',
          data: offlineItem,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3
        });
        
        return offlineId;
      },
      
      updateOfflinePunchlistItem: (id: string, updates: Partial<PunchlistItem>) => {
        set(state => ({
          punchlistItems: state.punchlistItems.map(item => 
            item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
          )
        }));
        
        // Add to sync queue if not already there
        const existingSync = get().syncQueue.find(op => 
          op.entity === 'punchlist_item' && op.data.id === id
        );
        
        if (!existingSync) {
          get().addToSyncQueue({
            id: `sync_update_${id}`,
            type: 'UPDATE',
            entity: 'punchlist_item',
            data: { id, ...updates },
            timestamp: new Date(),
            retryCount: 0,
            maxRetries: 3
          });
        }
      },
      
      deleteOfflinePunchlistItem: (id: string) => {
        set(state => ({
          punchlistItems: state.punchlistItems.filter(item => item.id !== id)
        }));
        
        get().addToSyncQueue({
          id: `sync_delete_${id}`,
          type: 'DELETE',
          entity: 'punchlist_item',
          data: { id },
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3
        });
      },
      
      createOfflinePhoto: async (photoData) => {
        const offlineId = `offline_photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const offlinePhoto: Photo = {
          ...photoData,
          id: offlineId,
          takenAt: new Date(),
          uploadedAt: new Date()
        };
        
        set(state => ({
          photos: [...state.photos, offlinePhoto]
        }));
        
        get().addToSyncQueue({
          id: `sync_photo_${offlineId}`,
          type: 'CREATE',
          entity: 'photo',
          data: offlinePhoto,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3
        });
        
        return offlineId;
      },
      
      updateOfflinePhoto: (id: string, updates: Partial<Photo>) => {
        set(state => ({
          photos: state.photos.map(photo => 
            photo.id === id ? { ...photo, ...updates } : photo
          )
        }));
      },
      
      deleteOfflinePhoto: (id: string) => {
        set(state => ({
          photos: state.photos.filter(photo => photo.id !== id)
        }));
      },
      
      // Data retrieval
      getOfflineProject: (id: string) => {
        return get().projects.find(p => p.id === id);
      },
      
      getOfflinePunchlistItems: (projectId: string) => {
        return get().punchlistItems.filter(item => item.projectId === projectId);
      },
      
      getOfflinePhotos: (itemId: string) => {
        return get().photos.filter(photo => 
          photo.id.includes(itemId) || photo.id.includes('offline')
        );
      },
      
      // Sync status
      getPendingChanges: () => {
        return get().syncQueue;
      },
      
      getSyncStatus: () => {
        const { syncQueue, lastSyncTime, isOnline } = get();
        return {
          pendingOperations: syncQueue.length,
          lastSyncTime,
          isOnline,
          syncInProgress: false
        };
      }
    }),
    {
      name: 'offline-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        punchlistItems: state.punchlistItems,
        photos: state.photos,
        users: state.users,
        syncQueue: state.syncQueue,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

// Helper function to process sync operations
async function processSyncOperation(operation: SyncOperation): Promise<void> {
  // This would integrate with your API client
  // For now, we'll simulate the API calls
  switch (operation.type) {
    case 'CREATE':
      // await apiClient.create(operation.entity, operation.data);
      break;
    case 'UPDATE':
      // await apiClient.update(operation.entity, operation.data.id, operation.data);
      break;
    case 'DELETE':
      // await apiClient.delete(operation.entity, operation.data.id);
      break;
  }
}


