import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ProjectsScreen = () => {
  const navigation = useNavigation();

  const dashboardItems = [
    {
      id: 1,
      title: 'Tasks',
      icon: '📋',
      color: '#f59e0b', // Orange like Bridgit
      onPress: () => navigation.navigate('Punchlist'),
    },
    {
      id: 2,
      title: 'Insights',
      icon: '📊',
      color: '#10b981', // Green like Bridgit
      onPress: () => navigation.navigate('Reports'),
    },
    {
      id: 3,
      title: 'Quality',
      icon: '✅',
      color: '#06b6d4', // Blue like Bridgit
      onPress: () => navigation.navigate('Punchlist'),
    },
    {
      id: 4,
      title: 'Notifications',
      icon: '🔔',
      color: '#8b5cf6', // Purple like Bridgit
      badge: '99+',
      onPress: () => {},
    },
    {
      id: 5,
      title: 'Directory',
      icon: '👥',
      color: '#60a5fa', // Light blue like Bridgit
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const currentProject = "The Pacific - Owner's Deficiencies";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Bridgit</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Icon size={40} icon="account" style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Project Title */}
        <Text style={styles.projectTitle}>{currentProject}</Text>

        {/* Dashboard Cards Grid */}
        <View style={styles.cardGrid}>
          {dashboardItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.cardContainer, { backgroundColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Your Projects Section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Your Projects</Text>
          
          <TouchableOpacity 
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: 1 })}
          >
            <Card style={styles.projectCardInner}>
              <Card.Content>
                <Title style={styles.projectCardTitle}>{currentProject}</Title>
                <Text style={styles.projectCardSubtitle}>870 Open Tasks • 966 Complete</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  avatar: {
    backgroundColor: '#6b7280',
  },
  projectTitle: {
    fontSize: 18,
    color: '#4b5563',
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontWeight: '500',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardIcon: {
    fontSize: 40,
    alignSelf: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  projectsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 15,
  },
  projectCard: {
    marginBottom: 20,
  },
  projectCardInner: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  projectCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default ProjectsScreen;