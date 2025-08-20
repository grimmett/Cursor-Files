import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Card, Button, Chip, ProgressBar, List, Divider } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../stores/offlineStore';
import DataSyncService, { SyncProgress } from '../services/dataSyncService';
import { formatDateTime } from '../../../shared/utils';

interface SyncStatusBarProps {
  onSyncPress?: () => void;
}

export default function SyncStatusBar({ onSyncPress }: SyncStatusBarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const offlineStore = useOfflineStore();
  const syncService = DataSyncService.getInstance();
  
  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      offlineStore.setOnlineStatus(online);
    });
    
    return unsubscribe;
  }, []);
  
  const pendingChanges = offlineStore.getPendingChanges();
  const syncStatus = offlineStore.getSyncStatus();
  
  const handleSyncPress = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'You are currently offline. Changes will be uploaded when you reconnect to the internet.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (pendingChanges.length === 0) {
      Alert.alert('No Changes', 'All changes are already synced.');
      return;
    }
    
    if (onSyncPress) {
      onSyncPress();
    } else {
      setShowSyncModal(true);
    }
  };
  
  const startSync = async () => {
    setIsSyncing(true);
    setSyncProgress(null);
    
    try {
      const result = await syncService.uploadOfflineChanges();
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Successfully uploaded ${result.uploaded} changes.`,
          [{ text: 'OK' }]
        );
        setShowSyncModal(false);
      } else {
        Alert.alert(
          'Sync Failed',
          `Failed to upload ${result.errors.length} changes:\n${result.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Sync Error', 'An unexpected error occurred during sync.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };
  
  const getStatusColor = () => {
    if (!isOnline) return '#ef4444';
    if (pendingChanges.length > 0) return '#f59e0b';
    return '#10b981';
  };
  
  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (pendingChanges.length > 0) return `${pendingChanges.length} pending`;
    return 'Synced';
  }
  
  const getStatusIcon = () => {
    if (!isOnline) return 'cloud-offline';
    if (pendingChanges.length > 0) return 'cloud-upload';
    return 'cloud-checkmark';
  };
  
  return (
    <>
      <TouchableOpacity
        style={[styles.container, { borderLeftColor: getStatusColor() }]}
        onPress={handleSyncPress}
        activeOpacity={0.7}
      >
        <View style={styles.statusContent}>
          <Ionicons
            name={getStatusIcon() as any}
            size={20}
            color={getStatusColor()}
            style={styles.statusIcon}
          />
          
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {syncStatus.lastSyncTime && (
              <Text style={styles.lastSyncText}>
                Last sync: {formatDateTime(syncStatus.lastSyncTime)}
              </Text>
            )}
          </View>
          
          {pendingChanges.length > 0 && (
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 12 }}
              style={styles.pendingChip}
            >
              {pendingChanges.length}
            </Chip>
          )}
          
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#6b7280"
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>
      
      {/* Sync Modal */}
      <Modal
        visible={showSyncModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sync Changes</Text>
            <TouchableOpacity
              onPress={() => setShowSyncModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Sync Progress */}
            {syncProgress && (
              <Card style={styles.progressCard}>
                <Card.Content>
                  <Text style={styles.progressTitle}>
                    {syncProgress.stage === 'complete' ? 'Sync Complete' : 'Syncing...'}
                  </Text>
                  <Text style={styles.progressMessage}>{syncProgress.message}</Text>
                  {syncProgress.stage !== 'complete' && (
                    <ProgressBar
                      progress={syncProgress.current / syncProgress.total}
                      color="#2563eb"
                      style={styles.progressBar}
                    />
                  )}
                </Card.Content>
              </Card>
            )}
            
            {/* Pending Changes Summary */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Pending Changes</Text>
                <Text style={styles.summaryText}>
                  {pendingChanges.length} changes waiting to be uploaded
                </Text>
                
                <View style={styles.changeTypes}>
                  {['project', 'punchlist_item', 'photo', 'user'].map(entity => {
                    const count = pendingChanges.filter(op => op.entity === entity).length;
                    if (count === 0) return null;
                    
                    return (
                      <Chip
                        key={entity}
                        mode="outlined"
                        style={styles.changeTypeChip}
                        textStyle={{ fontSize: 12 }}
                      >
                        {count} {entity.replace('_', ' ')}
                      </Chip>
                    );
                  })}
                </View>
              </Card.Content>
            </Card>
            
            {/* Change Details */}
            <Card style={styles.detailsCard}>
              <Card.Content>
                <Text style={styles.detailsTitle}>Change Details</Text>
                {pendingChanges.map((change, index) => (
                  <View key={change.id}>
                    <List.Item
                      title={`${change.type} ${change.entity.replace('_', ' ')}`}
                      description={change.timestamp.toLocaleString()}
                      left={props => (
                        <List.Icon
                          {...props}
                          icon={
                            change.type === 'CREATE' ? 'plus-circle' :
                            change.type === 'UPDATE' ? 'pencil' : 'delete'
                          }
                          color={
                            change.type === 'CREATE' ? '#10b981' :
                            change.type === 'UPDATE' ? '#f59e0b' : '#ef4444'
                          }
                        />
                      )}
                      right={props => (
                        <Chip
                          {...props}
                          mode="outlined"
                          textStyle={{ fontSize: 10 }}
                          style={styles.retryChip}
                        >
                          {change.retryCount}/{change.maxRetries}
                        </Chip>
                      )}
                    />
                    {index < pendingChanges.length - 1 && <Divider />}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </ScrollView>
          
          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowSyncModal(false)}
              style={styles.modalButton}
              disabled={isSyncing}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={startSync}
              style={styles.modalButton}
              loading={isSyncing}
              disabled={isSyncing || pendingChanges.length === 0}
              icon="cloud-upload"
            >
              Start Sync
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  pendingChip: {
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  changeTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  changeTypeChip: {
    marginRight: 8,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryChip: {
    alignSelf: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});




