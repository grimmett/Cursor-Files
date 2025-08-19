import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FAB, Badge, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ItemStatus } from '../../../shared/types';

interface StatusSection {
  id: string;
  title: string;
  status: ItemStatus;
  count: number;
  icon: string;
  color: string;
}

const PunchlistScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const statusSections: StatusSection[] = [
    {
      id: '1',
      title: 'Draft',
      status: ItemStatus.OPEN,
      count: 2,
      icon: '🟡',
      color: '#f59e0b',
    },
    {
      id: '2',
      title: 'Open',
      status: ItemStatus.OPEN,
      count: 870,
      icon: '⭕',
      color: '#6b7280',
    },
    {
      id: '3',
      title: 'Complete',
      status: ItemStatus.COMPLETED,
      count: 966,
      icon: '✅',
      color: '#10b981',
    },
    {
      id: '4',
      title: 'Closed',
      status: ItemStatus.VERIFIED,
      count: 10691,
      icon: '🔵',
      color: '#06b6d4',
    },
  ];

  const renderStatusSection = ({ item }: { item: StatusSection }) => (
    <TouchableOpacity
      style={styles.statusRow}
      onPress={() => navigation.navigate('PunchlistItem', { 
        status: item.status,
        title: item.title 
      })}
      activeOpacity={0.7}
    >
      <View style={styles.statusContent}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusIcon, { backgroundColor: item.color }]}>
            <Text style={styles.statusEmoji}>{item.icon}</Text>
          </View>
          <Text style={styles.statusTitle}>{item.title}</Text>
        </View>
        <View style={styles.statusRight}>
          <Text style={styles.taskCount}>{item.count.toLocaleString()}</Text>
          <Text style={styles.taskLabel}>Tasks</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Pacific - Owner's Deficiencies</Text>
        <View style={styles.headerRight}>
          <Badge style={styles.notificationBadge}>99+</Badge>
          <TouchableOpacity style={styles.searchButton}>
            <Text>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Status Sections List */}
      <FlatList
        data={statusSections}
        keyExtractor={(item) => item.id}
        renderItem={renderStatusSection}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={() => navigation.navigate('PunchlistItem', { isNew: true })}
      />

      {/* Bottom Tab Bar Spacer */}
      <View style={styles.bottomSpacer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#374151',
    minHeight: 60,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    numberOfLines: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  searchButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f3f4f6',
  },
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
  statusRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  taskCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  taskLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#06b6d4',
  },
  bottomSpacer: {
    height: 80, // Space for bottom tab navigation
  },
});

export default PunchlistScreen;