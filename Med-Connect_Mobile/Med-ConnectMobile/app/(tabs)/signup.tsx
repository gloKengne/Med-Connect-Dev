import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, Platform, KeyboardAvoidingView } from 'react-native';

const API_URL = 'http://192.168.1.165:5000/api'; // Base API URL

export default function SignUpPage({ navigation }: { navigation: any }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [userType, setUserType] = useState('patient');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const [bloodType, setBloodType] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');

  // State for patient medical information
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Date picker states
  const [selectedYear, setSelectedYear] = useState<number | string>('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | string>('');

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1920; year--) {
      years.push(year);
    }
    return years;
  };

  const generateDays = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleDateSelect = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay.toString().padStart(2, '0')}`;
      setDateOfBirth(formattedDate);
      setShowDatePicker(false);
    }
  };

  const handleSignin = () => {
    navigation.navigate('SignIn');
  };

  const validateBasicInfo = () => {
    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email');
      return false;
    }

    if (!dateOfBirth) {
      setErrorMessage('Please select your date of birth');
      return false;
    }

    if (!gender) {
      setErrorMessage('Please select your gender');
      return false;
    }

    return true;
  };

  const validateDoctorInfo = () => {
    if (!specialty.trim()) {
      Alert.alert('Error', 'Please enter your medical specialty');
      return false;
    }
    if (!hospital.trim()) {
      Alert.alert('Error', 'Please enter your hospital/clinic');
      return false;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Error', 'Please enter your license number');
      return false;
    }
    const yearsExp = parseFloat(yearsOfExperience);
      if (!yearsOfExperience.trim() || isNaN(yearsExp) || yearsExp < 0) {
        Alert.alert('Error', 'Please enter valid years of experience');
        return false;
      }
    const consultationFeeNum = parseFloat(consultationFee);
      if (!consultationFee.trim() || isNaN(consultationFeeNum) || consultationFeeNum < 0) {
        Alert.alert('Error', 'Please enter valid consultation fee');
        return false;
      }
  
  return true;
  };

  const handleContinue = () => {
    if (!validateBasicInfo()) {
      return;
    }

    if (userType === 'patient') {
      setShowPatientModal(true);
    } else {
      setShowDoctorModal(true);
    }
  };

  const handlePatientSignup = async () => {
    setLoading(true);
    
    try {
      // Parse allergies from string to array
      const allergiesArray = allergies.trim() ? allergies.split(',').map(allergy => ({
        name: allergy.trim(),
        severity: "mild", // Default severity
        reaction: ""
      })) : [];

      // Parse current medications from string to array
      const medicationsArray = currentMedications.trim() ? currentMedications.split(',').map(med => ({
        name: med.trim(),
        dosage: "",
        frequency: "",
        startDate: new Date()
      })) : [];

      // Parse medical history from string to array
      const medicalHistoryArray = medicalHistory.trim() ? medicalHistory.split(',').map(condition => ({
        condition: condition.trim(),
        diagnosedDate: new Date(),
        notes: ""
      })) : [];

      const patientData = {
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        password,
        phone,
        address,
        dateOfBirth,
        gender,
        userType: 'patient',
        bloodType: bloodType || undefined,
        emergencyContact: emergencyContactName.trim() ? {
          name: emergencyContactName,
          relationship: emergencyContactRelationship,
          phone: emergencyContactPhone
        } : undefined,
        allergies: allergiesArray,
        currentMedications: medicationsArray,
        medicalHistory: medicalHistoryArray
      };

      console.log('Sending patient registration:', patientData);

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      console.log('Patient registration response:', data);

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Account created successfully! You can now sign in.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setShowPatientModal(false);
                router.push('/signin');
              }
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message || data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Patient signup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSignup = async () => {
    if (!validateDoctorInfo()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const doctorData = {
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        password,
        phone,
        address,
        dateOfBirth,
        gender,
        userType: 'doctor',
        specialty,
        hospital,
        licenseNumber,
        yearsOfExperience: parseInt(yearsOfExperience),
        consultationFee: parseFloat(consultationFee),
        bio: bio || undefined,
        isVerified: false, // Doctors need verification
        rating: 0,
        reviewCount: 0,
        availableToday: true,
        availability: new Map()
      };

      console.log('Sending doctor registration:', doctorData);

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });

      const data = await response.json();
      console.log('Doctor registration response:', data);

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Doctor account created! Please wait for verification from admin.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                setShowDoctorModal(false);
                router.push('/signin');
              }
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message || data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Doctor signup error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⚕️</Text>
            </View>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Med-Connect to manage your health</Text>

          <View style={styles.form}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+237 XXX XXX XXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street, City"
                value={address}
                onChangeText={setAddress}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dropdownText, dateOfBirth && styles.dropdownTextSelected]}>
                  {dateOfBirth || 'Select date'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderContainer}>
                {['male', 'female', 'other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.genderButton, gender === option && styles.genderButtonSelected]}
                    onPress={() => setGender(option)}
                    disabled={loading}
                  >
                    <Text style={[styles.genderText, gender === option && styles.genderTextSelected]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>I am registering as *</Text>
              
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
                  <Text style={styles.radioDescription}>Manage my health records</Text>
                </View>
              </TouchableOpacity>

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
                  <Text style={styles.radioDescription}>Access patient records</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, loading && styles.continueButtonDisabled]} 
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignin} disabled={loading}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {generateDays().map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.pickerItem, selectedDay === day && styles.pickerItemSelected]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[styles.pickerItemText, selectedDay === day && styles.pickerItemTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[styles.pickerItem, selectedMonth === month.value && styles.pickerItemSelected]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text style={[styles.pickerItemText, selectedMonth === month.value && styles.pickerItemTextSelected]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerItem, selectedYear === year && styles.pickerItemSelected]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[styles.pickerItemText, selectedYear === year && styles.pickerItemTextSelected]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleDateSelect}
              >
                <Text style={styles.modalButtonPrimaryText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Patient Registration Modal */}
      <Modal
        visible={showPatientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !loading && setShowPatientModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Additional Information</Text>
              <Text style={styles.modalSubtitle}>Help us serve you better</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Type (Optional)</Text>
                <View style={styles.bloodTypeContainer}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.bloodTypeButton, bloodType === type && styles.bloodTypeButtonSelected]}
                      onPress={() => setBloodType(type)}
                      disabled={loading}
                    >
                      <Text style={[styles.bloodTypeText, bloodType === type && styles.bloodTypeTextSelected]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Medical Information (Optional)</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Allergies</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Separate with commas, e.g., Penicillin, Peanuts"
                  value={allergies}
                  onChangeText={setAllergies}
                  multiline
                  numberOfLines={2}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Medications</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Separate with commas, e.g., Lisinopril, Metformin"
                  value={currentMedications}
                  onChangeText={setCurrentMedications}
                  multiline
                  numberOfLines={2}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical History</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Separate with commas, e.g., Diabetes, Hypertension"
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                  multiline
                  numberOfLines={2}
                  editable={!loading}
                />
              </View>

              <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jane Doe"
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  value={emergencyContactRelationship}
                  onChangeText={setEmergencyContactRelationship}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+237 XXX XXX XXX"
                  value={emergencyContactPhone}
                  onChangeText={setEmergencyContactPhone}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  editable={!loading}
                />
              </View>

              <View style={styles.bottomPadding} />
            </ScrollView>

            <View style={styles.modalButtonsFixed}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowPatientModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonSecondaryText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, loading && styles.modalButtonDisabled]}
                onPress={handlePatientSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Complete Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Doctor Registration Modal */}
      <Modal
        visible={showDoctorModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !loading && setShowDoctorModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Professional Information</Text>
              <Text style={styles.modalSubtitle}>Complete your professional profile</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical Specialty *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Cardiology, Pediatrics, etc."
                  value={specialty}
                  onChangeText={setSpecialty}
                  autoCapitalize="words"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hospital/Clinic *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your primary workplace"
                  value={hospital}
                  onChangeText={setHospital}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>License Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Medical license number"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="characters"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 5"
                  value={yearsOfExperience}
                  onChangeText={setYearsOfExperience}
                  keyboardType="numeric"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Consultation Fee (XAF) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 15000"
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  keyboardType="numeric"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief description of your practice and expertise"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                  editable={!loading}
                />
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  ⓘ Note: Doctor accounts require verification by administration. You'll be notified once your account is approved.
                </Text>
              </View>

              <View style={styles.bottomPadding} />
            </ScrollView>

            <View style={styles.modalButtonsFixed}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowDoctorModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonSecondaryText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, loading && styles.modalButtonDisabled]}
                onPress={handleDoctorSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Complete Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  textArea: {
    minHeight: 80,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    color: '#1a1a1a',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  genderText: {
    fontSize: 14,
    color: '#666',
  },
  genderTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
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
  },
  continueButton: {
    backgroundColor: '#1e5a8e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#6b9dc4',
  },
  continueButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 24,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 8,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  bloodTypeButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  bloodTypeText: {
    fontSize: 14,
    color: '#666',
  },
  bloodTypeTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#666',
  },
  pickerItemTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1e5a8e',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#1e5a8e',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButtonsFixed: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#1e5a8e',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: '#6b9dc4',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },
});