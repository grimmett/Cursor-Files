import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Chip,
  List,
  Divider,
  Checkbox,
  TextInput,
  Searchbar
} from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import DataSyncService, { SyncProgress, SyncResult } from '../services/dataSyncService';
import { useOfflineStore } from '../stores/offlineStore';
import { Project } from '../../../shared/types';
import { formatDate } from '../../../shared/utils';

interface OfflineDownloadScreenProps {}

export default function OfflineDownloadScreen({}: OfflineDownloadScreenProps) {
  const navigation = useNavigation();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<SyncProgress | null>(null);
  const [downloadResult, setDownloadResult] = useState<SyncResult | null>(null);
  const [showDownloadComplete, setShowDownloadComplete] = useState(false);
  
  const offlineStore = useOfflineStore();
  const syncService = DataSyncService.getInstance();
  
  // Mock projects - in real app, these would come from API
  const [availableProjects, setAvailableProjects] = useState<Project[]>([
    {
      id: 'project1',
      name: 'Downtown Office Tower',
      description: 'New 20-story office building in downtown',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      clientName: 'Downtown Development Corp',
      startDate: new Date('2024-01-01'),
      status: 'in_progress',
      createdBy: 'user1',
      assignedUsers: ['user1', 'user2'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'project2',
      name: 'Riverside Apartments',
      description: 'Residential complex with 150 units',
      address: '456 River Rd',
      city: 'Riverside',
      state: 'CA',
      zipCode: '12346',
      clientName: 'Riverside Properties LLC',
      startDate: new Date('2024-02-01'),
      status: 'planning',
      createdBy: 'user1',
      assignedUsers: ['user1'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'project3',
      name: 'Shopping Center Renovation',
      description: 'Major renovation of existing shopping center',
      address: '789 Mall Blvd',
      city: 'Malltown',
      state: 'CA',
      zipCode: '12347',
      clientName: 'Mall Management Inc',
      startDate: new Date('2024-03-01'),
      status: 'in_progress',
      createdBy: 'user1',
      assignedUsers: ['user1', 'user3'],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-10')
    }
  ]);
  
  const filteredProjects = availableProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };
  
  const selectAllProjects = () => {
    setSelectedProjects(filteredProjects.map(p => p.id));
  };
  
  const deselectAllProjects = () => {
    setSelectedProjects([]);
  };
  
  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#6b7280';
      case 'in_progress': return '#2563eb';
      case 'completed': return '#10b981';
      case 'on_hold': return '#f59e0b';
      default: return '#6b7280';
    }
  };
  
  const getProjectStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return 'clipboard-outline';
      case 'in_progress': return 'construct-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'on_hold': return 'pause-circle-outline';
      default: return 'help-circle-outline';
    }
  };
  
  const startDownload = async () => {
    if (selectedProjects.length === 0) {
      Alert.alert('No Projects Selected', 'Please select at least one project to download.');
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(null);
    setDownloadResult(null);
    
    try {
      const result = await syncService.downloadProjectData(
        selectedProjects,
        (progress) => setDownloadProgress(progress)
      );
      
      setDownloadResult(result);
      setShowDownloadComplete(true);
      
      if (result.success) {
        Alert.alert(
          'Download Complete',
          `Successfully downloaded:\n` +
          `• ${result.projectsDownloaded} projects\n` +
          `• ${result.punchlistItemsDownloaded} punchlist items\n` +
          `• ${result.photosDownloaded} photos\n` +
          `• ${result.usersDownloaded} users\n\n` +
          `You can now work offline with this data.`
        );
      } else {
        Alert.alert(
          'Download Failed',
          `Some items failed to download:\n${result.errors.join('\n')}`
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'An unexpected error occurred during download.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const getStorageEstimate = () => {
    // Rough estimate: 1 project = ~1MB, 1 item = ~10KB, 1 photo = ~500KB
    const projects = selectedProjects.length;
    const estimatedItems = projects * 50; // Assume 50 items per project
    const estimatedPhotos = estimatedItems * 2; // Assume 2 photos per item
    
    const totalMB = (projects * 1) + (estimatedItems * 0.01) + (estimatedPhotos * 0.5);
    return totalMB.toFixed(1);
  };
  
  const getDownloadTimeEstimate = () => {
    const projects = selectedProjects.length;
    // Rough estimate: 1 project takes ~30 seconds
    const totalSeconds = projects * 30;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Ionicons name="cloud-download-outline" size={48} color="#2563eb" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Download for Offline Use</Text>
                <Text style={styles.headerSubtitle}>
                  Download project data to work without internet connection
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Download Progress */}
        {isDownloading && downloadProgress && (
          <Card style={styles.progressCard}>
            <Card.Content>
              <Text style={styles.progressTitle}>Downloading...</Text>
              <Text style={styles.progressMessage}>{downloadProgress.message}</Text>
              <ProgressBar
                progress={downloadProgress.current / downloadProgress.total}
                color="#2563eb"
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {downloadProgress.current} of {downloadProgress.total} - {downloadProgress.stage}
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {/* Download Complete */}
        {showDownloadComplete && downloadResult && (
          <Card style={styles.resultCard}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={downloadResult.success ? "checkmark-circle" : "alert-circle"}
                  size={32}
                  color={downloadResult.success ? "#10b981" : "#ef4444"}
                />
                <Text style={styles.resultTitle}>
                  {downloadResult.success ? 'Download Complete' : 'Download Failed'}
                </Text>
              </View>
              
              <View style={styles.resultStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{downloadResult.projectsDownloaded}</Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{downloadResult.punchlistItemsDownloaded}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{downloadResult.photosDownloaded}</Text>
                  <Text style={styles.statLabel}>Photos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{downloadResult.usersDownloaded}</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </View>
              </View>
              
              {downloadResult.errors.length > 0 && (
                <View style={styles.errorSection}>
                  <Text style={styles.errorTitle}>Errors:</Text>
                  {downloadResult.errors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>• {error}</Text>
                  ))}
                </View>
              )}
              
              <Button
                mode="contained"
                onPress={() => {
                  setShowDownloadComplete(false);
                  navigation.goBack();
                }}
                style={styles.continueButton}
              >
                Continue
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {/* Project Selection */}
        {!isDownloading && !showDownloadComplete && (
          <>
            <Card style={styles.selectionCard}>
              <Card.Content>
                <View style={styles.selectionHeader}>
                  <Text style={styles.selectionTitle}>Select Projects</Text>
                  <View style={styles.selectionActions}>
                    <Button
                      mode="outlined"
                      onPress={selectAllProjects}
                      compact
                      style={styles.selectionButton}
                    >
                      Select All
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={deselectAllProjects}
                      compact
                      style={styles.selectionButton}
                    >
                      Clear
                    </Button>
                  </View>
                </View>
                
                <Text style={styles.selectionSubtitle}>
                  {selectedProjects.length} of {filteredProjects.length} projects selected
                </Text>
                
                {selectedProjects.length > 0 && (
                  <View style={styles.estimateInfo}>
                    <Chip icon="information" mode="outlined">
                      Estimated size: ~{getStorageEstimate()} MB
                    </Chip>
                    <Chip icon="time" mode="outlined">
                      Estimated time: ~{getDownloadTimeEstimate()}
                    </Chip>
                  </View>
                )}
              </Card.Content>
            </Card>
            
            {/* Search */}
            <Card style={styles.searchCard}>
              <Card.Content>
                <Searchbar
                  placeholder="Search projects..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                />
              </Card.Content>
            </Card>
            
            {/* Project List */}
            <Card style={styles.projectsCard}>
              <Card.Content>
                {filteredProjects.map((project) => (
                  <View key={project.id}>
                    <List.Item
                      title={project.name}
                      description={project.description}
                      left={props => (
                        <Checkbox
                          status={selectedProjects.includes(project.id) ? 'checked' : 'unchecked'}
                          onPress={() => toggleProjectSelection(project.id)}
                        />
                      )}
                      right={props => (
                        <View style={styles.projectMeta}>
                          <Chip
                            mode="outlined"
                            textStyle={{ fontSize: 10 }}
                            style={[
                              styles.statusChip,
                              { borderColor: getProjectStatusColor(project.status) }
                            ]}
                          >
                            {project.status.replace('_', ' ')}
                          </Chip>
                          <Text style={styles.projectDate}>
                            {formatDate(project.startDate)}
                          </Text>
                        </View>
                      )}
                      style={styles.projectItem}
                    />
                    {filteredProjects.indexOf(project) < filteredProjects.length - 1 && (
                      <Divider />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
            
            {/* Download Button */}
            <View style={styles.downloadSection}>
              <Button
                mode="contained"
                onPress={startDownload}
                disabled={selectedProjects.length === 0 || isDownloading}
                loading={isDownloading}
                icon="cloud-download"
                style={styles.downloadButton}
                contentStyle={styles.downloadButtonContent}
              >
                Download {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''} for Offline Use
              </Button>
              
              <Text style={styles.downloadNote}>
                ⚠️ Make sure you have a stable internet connection and sufficient storage space
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressCard: {
    margin: 16,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
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
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  resultCard: {
    margin: 16,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorSection: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 4,
  },
  continueButton: {
    width: '100%',
  },
  selectionCard: {
    margin: 16,
    marginBottom: 8,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    minWidth: 80,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  estimateInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: 'transparent',
  },
  projectsCard: {
    margin: 16,
    marginBottom: 8,
  },
  projectItem: {
    paddingVertical: 8,
  },
  projectMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusChip: {
    borderWidth: 1,
  },
  projectDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  downloadSection: {
    padding: 16,
    paddingBottom: 32,
  },
  downloadButton: {
    marginBottom: 12,
  },
  downloadButtonContent: {
    paddingVertical: 8,
  },
  downloadNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


