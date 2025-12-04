import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !companyName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(register({ email, password, firstName, lastName, companyName })).unwrap();
    } catch (err) {
      Alert.alert('Registration Failed', error || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your business with AI</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.input}
              placeholder="Company Name"
              placeholderTextColor="#8E8E93"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default RegisterScreen;
