import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import PunchlistScreen from './src/screens/PunchlistScreen';
import PunchlistItemScreen from './src/screens/PunchlistItemScreen';
import CameraScreen from './src/screens/CameraScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Components
import CustomDrawerContent from './src/components/CustomDrawerContent';
import TabBarIcon from './src/components/TabBarIcon';

// Store
import { useAuthStore } from './src/stores/authStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const queryClient = new QueryClient();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen 
        name="Punchlist" 
        component={PunchlistScreen}
        options={{ title: 'Punchlist' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#2563eb',
      }}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen 
            name="ProjectDetail" 
            component={ProjectDetailScreen}
            options={{ headerShown: true, title: 'Project Details' }}
          />
          <Stack.Screen 
            name="PunchlistItem" 
            component={PunchlistItemScreen}
            options={{ headerShown: true, title: 'Punchlist Item' }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{ headerShown: true, title: 'Take Photo' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}



