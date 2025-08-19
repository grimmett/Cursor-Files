import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuthStore } from '../stores/authStore';

const CustomDrawerContent = (props: any) => {
  const { user, logout } = useAuthStore();

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bridgit</Text>
        {user && (
          <Text style={styles.userInfo}>
            {user.firstName} {user.lastName}
          </Text>
        )}
      </View>
      
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Main')}
        >
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={logout}
        >
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  menu: {
    paddingVertical: 20,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
  },
});

export default CustomDrawerContent;