import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const ReportsScreen = () => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Reports Screen</Text>
    <Text style={styles.subtitle}>Coming soon...</Text>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 8 },
});

export default ReportsScreen;