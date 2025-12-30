// FindDoctorsPage.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FindDoctorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Emily Chen',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 127,
      hospital: 'City Hospital',
      available: true,
      connected: true
    },
    {
      id: 2,
      name: 'Dr. Michael Rodriguez',
      specialty: 'General Practitioner',
      rating: 4.8,
      reviews: 89,
      hospital: 'Wellness Clinic',
      available: true,
      connected: false
    },
    {
      id: 3,
      name: 'Dr. Sarah Johnson',
      specialty: 'Pediatrician',
      rating: 5.0,
      reviews: 156,
      hospital: "Children's Medical Center",
      available: true,
      connected: true
    }
  ]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const showAlert = (message: React.SetStateAction<string>, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const handleConnect = (doctorId: number) => {
    setDoctors(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId ? { ...doctor, connected: true } : doctor
      )
    );
    const doctor = doctors.find(d => d.id === doctorId);
    // showAlert(`Successfully connected with ${doctor.name}!`, 'success');
  };

  const handleDisconnect = (doctorId: number) => {
    setDoctors(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId ? { ...doctor, connected: false } : doctor
      )
    );
    const doctor = doctors.find(d => d.id === doctorId);
    // showAlert(`Disconnected from ${doctor.name}`, 'info');
  };

  const handleBookAppointment = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId);
    // showAlert(`Booking appointment with ${doctor.name}...`, 'info');
    // Add your booking logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Alert */}
      {alertVisible && (
        <View style={[styles.alertContainer, alertType === 'success' ? styles.alertSuccess : styles.alertInfo]}>
          <View style={styles.alertContent}>
            <Ionicons 
              name={alertType === 'success' ? 'checkmark-circle' : 'information-circle'} 
              size={24} 
              color={alertType === 'success' ? '#059669' : '#2563EB'} 
            />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>
        <View style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          <View style={styles.badge} />
        </View>
      </View>

      {/* Scrollable Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.navContainer}
        contentContainerStyle={styles.navContent}
      >
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Patient/patient_dashboard')}
        >
          <Text style={styles.navTabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Patient/records')}
        >
          <Text style={styles.navTabText}>My Records</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navTabActive}
          onPress={() => router.push('/(tabs)/Patient/findDoctorsPage')}
        >
          <Text style={styles.navTabTextActive}>Find Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Patient/appointmentPage')}
        >
          <Text style={styles.navTabText}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navTab}
        //   onPress={() => router.push('/(tabs)/Patient/messages')}
        >
          <Text style={styles.navTabText}>Messages</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Find Healthcare Providers</Text>
          <Text style={styles.subtitle}>
            Connect with verified doctors and manage your healthcare network
          </Text>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors by name or specialty..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Doctor Cards */}
        <View style={styles.doctorsContainer}>
          {doctors.map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              {/* Connected Badge */}
              {doctor.connected && (
                <View style={styles.connectedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.connectedBadgeText}>Connected</Text>
                </View>
              )}

              {/* Doctor Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={36} color="#2563EB" />
                </View>
              </View>

              {/* Doctor Info */}
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFA500" />
                  <Text style={styles.ratingText}>
                    {doctor.rating} ({doctor.reviews} reviews)
                  </Text>
                </View>

                {/* Hospital */}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{doctor.hospital}</Text>
                </View>

                {/* Availability */}
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#10B981" />
                  <Text style={styles.availableText}>Available Today</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookAppointment(doctor.id)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                  <Text style={styles.bookButtonText}>Book Appointment</Text>
                </TouchableOpacity>

                {doctor.connected ? (
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => handleDisconnect(doctor.id)}
                  >
                    <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnect(doctor.id)}
                  >
                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  navContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 50,
  },
  navContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  navTab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabActive: {
    borderBottomColor: '#2563EB',
  },
  navTabText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  navTabTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  doctorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  connectedBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 6,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  availableText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  bookButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  disconnectButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  alertContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  alertSuccess: {
    backgroundColor: '#D1FAE5',
  },
  alertInfo: {
    backgroundColor: '#DBEAFE',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});