import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import FinancialScreen from '../screens/Financial/FinancialScreen';
import TeamScreen from '../screens/Team/TeamScreen';
import ProjectsScreen from '../screens/Projects/ProjectsScreen';
import AssistantScreen from '../screens/Assistant/AssistantScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Tickets: undefined;
  Engineers: undefined;
  Inventory: undefined;
  Assistant: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopColor: '#2C2C2E',
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1C1C1E',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={FinancialScreen}
        options={{
          title: 'Fault Tickets',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-alert" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Engineers"
        component={TeamScreen}
        options={{
          title: 'Engineers',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-hard-hat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={ProjectsScreen}
        options={{
          title: 'Parts',
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => (
            <Icon name="robot" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
