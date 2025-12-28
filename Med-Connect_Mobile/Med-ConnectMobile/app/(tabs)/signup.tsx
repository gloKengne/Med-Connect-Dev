import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import DoctorRegistrationModal from '../../components/DoctorRegistrationModal'

const API_URL = 'http://localhost:5000/api/auth';

type DoctorData = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [pendingDoctorData, setPendingDoctorData] = useState<DoctorData | null>(null);

  const handleSignin = () => {
    console.log('Navigate to signin');
    router.push("/signin");
  };

  const handleSignUp = async () => {
    // Clear previous error message
    setErrorMessage('');

    // Validation checks
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    // If user is a doctor, show the modal for additional information
    if (userType === 'doctor') {
      setPendingDoctorData({
        name: fullName,
        email: email.toLowerCase().trim(),
        password: password,
        role: 'doctor'
      });
      setShowDoctorModal(true);
      return;
    }

    // For patients, proceed with registration
    setLoading(true);
    console.log('Sign up with:', { fullName, email, password, userType });

    try {
      const role = 'patient';

      console.log('Sending request to:', `${API_URL}/register`);
      console.log('Request body:', {
        name: fullName,
        email: email.toLowerCase().trim(),
        role: role,
      });

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: email.toLowerCase().trim(),
          password: password,
          role: role,
        }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      console.log("response", response);
      
      if (response.ok) {
        console.log("Account created successfully, redirecting to signin");
        router.push('/signin');
      } else {
        // Display custom error message
        setErrorMessage(data.message || data.error || 'Failed to create account');
      }
    } 
    catch (error) {
      console.error('Sign up error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowDoctorModal(false);
    setPendingDoctorData(null);
    router.push('/signin');
  };

  // Handle doctor registration completion (not implemented yet in backend)
  const handleDoctorRegistrationComplete = async (completeData: any) => {
    console.log('Doctor registration data:', completeData);
    
    // TODO: Implement backend API call when ready
    Alert.alert(
      'Registration Not Available',
      'Doctor registration is coming soon! The backend is not ready yet.',
      [{ text: 'OK', onPress: handleModalClose }]
    );
    
    // When backend is ready, uncomment and implement this:
    /*
    try {
      const response = await fetch(`${API_URL}/register-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const data = await response.json();
      
      if (response.ok) {
        handleModalClose();
        router.push('/signin');
      } else {
        Alert.alert('Error', data.message || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('Doctor registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
    */
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⚕️</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Med-Connect to manage your health</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* User Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>I am registering as</Text>
              
              {/* Patient Option */}
              <TouchableOpacity 
                style={[styles.radioOption, userType === 'patient' && styles.radioOptionSelected]}
                onPress={() => setUserType('patient')}
                disabled={loading}
              >
                <View style={styles.radioButton}>
                  <View style={[styles.radioOuter, userType === 'patient' && styles.radioOuterSelected]}>
                    {userType === 'patient' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Patient</Text>
                  <Text style={styles.radioDescription}>Manage my health records and connect with doctors</Text>
                </View>
              </TouchableOpacity>

              {/* Healthcare Professional Option */}
              <TouchableOpacity 
                style={[styles.radioOption, userType === 'doctor' && styles.radioOptionSelected]}
                onPress={() => setUserType('doctor')}
                disabled={loading}
              >
                <View style={styles.radioButton}>
                  <View style={[styles.radioOuter, userType === 'doctor' && styles.radioOuterSelected]}>
                    {userType === 'doctor' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Healthcare Professional</Text>
                  <Text style={styles.radioDescription}>Access patient records and manage consultations</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignin} disabled={loading}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Doctor Registration Modal */}
      <DoctorRegistrationModal
        visible={showDoctorModal}
        onClose={handleModalClose}
        onComplete={handleDoctorRegistrationComplete}
        doctorData={pendingDoctorData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  radioButton: {
    marginRight: 12,
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2563eb',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  signUpButton: {
    backgroundColor: '#1e5a8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonDisabled: {
    backgroundColor: '#6b9dc4',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    fontSize: 14,
    color: '#1e5a8e',
    fontWeight: '500',
  },
});