import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  try {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    );
  } catch (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {String(error)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
});
