import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

// CHANGE: Using localhost for Web testing to avoid connection refused
const API_URL = 'http://192.168.1.165:5000/api';

export default function OnboardingPage() {
  const { token } = useLocalSearchParams(); 
  
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');

  const handleCompleteProfile = async () => {
    // Basic validation
    if (!specialty || !hospital || !yearsOfExperience || !consultationFee) {
      Alert.alert('Required Fields', 'Please fill in all fields marked with *');
      return;
    }

    if (!token) {
      Alert.alert('Session Expired', 'Please go back and sign up again.');
      return;
    }

    setLoading(true);
    console.log("📤 Updating Doctor Profile with token:", token);

    try {
      // 1. Update Profile Information
      const profileResponse = await fetch(`${API_URL}/doctors/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure space between Bearer and token
        },
        body: JSON.stringify({
          specialty,
          hospital,
          yearsOfExperience: parseInt(yearsOfExperience),
          consultationFee: parseFloat(consultationFee),
          bio,
        }),
      });

      if(profileResponse.status === 404){
        console.log("❌ API Endpoint Not Found: Please check the URL.");
      }

      const profileData = await profileResponse.json();

      if (profileResponse.ok) {
        console.log("✅ Profile updated. Finalizing onboarding...");

        // 2. Mark as Verified
        const completionResponse = await fetch(`${API_URL}/doctors/complete-onboarding`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (completionResponse.ok) {
        //   Alert.alert('Success', 'Profile completed! Welcome to the team.', [
        //     { text: 'Start Working', onPress: () => router.push('/(tabs)/Doctor/doctor_dashboard') }
        //   ]);
        router.push('/signin');
        } else {
          const compData = await completionResponse.json();
          Alert.alert('Finalization Error', compData.message || 'Verification failed');
        }
      } else {
        // If status is 403 or 401, token might be invalid
        Alert.alert('Update Failed', profileData.message || 'Error saving profile');
      }
    } catch (error) {
      console.error("❌ Onboarding Network Error:", error);
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Professional Profile</Text>
        <Text style={styles.subtitle}>Help patients know you better</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Medical Specialty *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Cardiologist" 
            value={specialty}
            onChangeText={setSpecialty}
          />

          <Text style={styles.label}>Hospital / Clinic *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Main City Hospital" 
            value={hospital}
            onChangeText={setHospital}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Experience (Years) *</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={yearsOfExperience}
                onChangeText={setYearsOfExperience}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Fee (XAF) *</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={consultationFee}
                onChangeText={setConsultationFee}
              />
            </View>
          </View>

          <Text style={styles.label}>Short Bio</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            multiline 
            numberOfLines={4}
            placeholder="Tell us about your background..."
            value={bio}
            onChangeText={setBio}
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Complete & Verify</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  input: { backgroundColor: '#f5f7fa', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e1e8f0', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  submitButton: { backgroundColor: '#1e5a8e', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});