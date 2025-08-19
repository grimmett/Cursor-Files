import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Button, Card, Badge, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const PunchlistItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isNew = false, status = 'Open' } = route.params || {};

  const [formData, setFormData] = useState({
    assignee: 'HOUSTON LANDSCAPES LTD',
    tags: 'SYNERGY COMMON AREA INSPECTION',
    dueDate: '',
    value: '',
    description: '',
    location: 'FLOOR 1',
  });

  const [itemDetails] = useState({
    id: '#14734',
    title: 'L01 - Exterior - Stairs - ends incomplete',
    createdBy: 'Paul Shannon, Synergy',
    createdDate: 'December 20, 2021',
    photos: 1,
  });

  const handleTakePhoto = () => {
    navigation.navigate('Camera');
  };

  const handleChooseFromLibrary = () => {
    // Implementation for choosing from photo library
    Alert.alert('Choose Photo', 'Photo library functionality coming soon');
  };

  const handleComplete = () => {
    Alert.alert('Complete Task', 'Mark this task as complete?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', style: 'default', onPress: () => navigation.goBack() },
    ]);
  };

  const handleApprove = () => {
    Alert.alert('Approve Task', 'Approve this completed task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default', onPress: () => navigation.goBack() },
    ]);
  };

  const handleSendEmail = () => {
    Alert.alert('Send Email', 'Send task email functionality coming soon');
  };

  const handleAddComment = () => {
    Alert.alert('Add Comment', 'Add comment functionality coming soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          {status}
        </Badge>
        <TouchableOpacity>
          <Text style={styles.moreButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {!isNew && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionLabel}>DETAILS</Text>
            <View style={styles.itemHeader}>
              <Text style={styles.itemId}>{itemDetails.id}</Text>
              <Text style={styles.createdDate}>Created on {itemDetails.createdDate}</Text>
            </View>
            <Text style={styles.itemTitle}>{itemDetails.title}</Text>
            <Text style={styles.createdBy}>Created By {itemDetails.createdBy}</Text>
          </View>
        )}

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {!isNew && (
              <Text style={styles.photoCount}>({itemDetails.photos} added)</Text>
            )}
          </View>
          
          <Card style={styles.photoCard}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>🖼️</Text>
            </View>
          </Card>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Text style={styles.photoButtonIcon}>📷</Text>
              <Text style={styles.photoButtonText}>TAKE A PHOTO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={handleChooseFromLibrary}>
              <Text style={styles.photoButtonIcon}>🖼️</Text>
              <Text style={styles.photoButtonText}>CHOOSE FROM LIBRARY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>{formData.location}</Text>
          <TouchableOpacity style={styles.addFloorPlan}>
            <Text style={styles.addFloorPlanText}>⭕ Add Floor Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Assignees Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Assignees</Text>
          <Text style={styles.fieldValue}>{formData.assignee}</Text>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Tags</Text>
          <Text style={styles.fieldValue}>{formData.tags}</Text>
        </View>

        {/* Due Date Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Due Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add due date"
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
          />
        </View>

        {/* Value Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Value</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add value"
            value={formData.value}
            onChangeText={(text) => setFormData({ ...formData, value: text })}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Communication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMMUNICATION</Text>
          <TouchableOpacity style={styles.emailButton} onPress={handleSendEmail}>
            <Text style={styles.emailIcon}>✈️</Text>
            <Text style={styles.emailText}>Send Task Email</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.commentsContainer}>
            <Text style={styles.noComments}>⭕ None added</Text>
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={styles.addComment}>add comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleComplete}
          style={[styles.actionButton, styles.completeButton]}
          labelStyle={styles.completeButtonText}
        >
          COMPLETE
        </Button>
        <Button
          mode="outlined"
          onPress={handleApprove}
          style={[styles.actionButton, styles.approveButton]}
          labelStyle={styles.approveButtonText}
        >
          APPROVE
        </Button>
      </View>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': return '#6b7280';
    case 'complete': return '#10b981';
    case 'closed': return '#06b6d4';
    case 'draft': return '#f59e0b';
    default: return '#6b7280';
  }
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
    backgroundColor: '#6b7280',
    minHeight: 60,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: 'white',
    color: '#1f2937',
  },
  moreButton: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  detailsSection: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  createdDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
  },
  photoCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  photoCard: {
    marginBottom: 16,
  },
  photoPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  photoIcon: {
    fontSize: 40,
    color: '#9ca3af',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    alignItems: 'center',
    flex: 1,
  },
  photoButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  addFloorPlan: {
    alignSelf: 'flex-start',
  },
  addFloorPlanText: {
    fontSize: 16,
    color: '#06b6d4',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  textInput: {
    fontSize: 16,
    color: '#9ca3af',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 8,
    backgroundColor: '#f3f4f6',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emailText: {
    fontSize: 16,
    color: '#06b6d4',
  },
  commentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noComments: {
    fontSize: 16,
    color: '#9ca3af',
  },
  addComment: {
    fontSize: 16,
    color: '#06b6d4',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  completeButton: {
    borderColor: '#10b981',
  },
  completeButtonText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  approveButton: {
    borderColor: '#06b6d4',
  },
  approveButtonText: {
    color: '#06b6d4',
    fontWeight: 'bold',
  },
});

export default PunchlistItemScreen;

