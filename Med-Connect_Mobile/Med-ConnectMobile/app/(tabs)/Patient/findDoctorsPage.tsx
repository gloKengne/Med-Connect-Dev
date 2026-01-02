// FindDoctorsPage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  hospital: string;
  available: boolean;
  connectionStatus: 'none' | 'pending' | 'accepted'; // Changed from boolean
  isVerified: boolean;
}

export default function FindDoctorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      if (!token) {
        console.error('❌ No token found in AsyncStorage!');
        showAlert('Please login first', 'error');
        setLoading(false);
        return;
      }

      console.log('📡 Making request to:', `${API_URL}/doctors`);

      const response = await fetch(`${API_URL}/doctors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.status === 401 || response.status === 403) {
        console.error('🚫 Authentication failed');
        showAlert('Session expired. Please login again.', 'error');
        await AsyncStorage.removeItem('authToken');
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log('✅ Successfully fetched doctors:', data.doctors.length);
        
        // Map doctors and check connection status for each
        const mappedDoctors: Doctor[] = await Promise.all(
          data.doctors.map(async (doctor: any) => {
            let connectionStatus: 'none' | 'pending' | 'accepted' = 'none';
            
            try {
              const connectionCheck = await fetch(`${API_URL}/connections/check/${doctor._id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              const connectionData = await connectionCheck.json();
              console.log(`Connection status for ${doctor.firstName}:`, connectionData);
              
              if (connectionData.success && connectionData.connection) {
                if (connectionData.isConnected) {
                  connectionStatus = 'accepted';
                } else if (connectionData.isPending) {
                  connectionStatus = 'pending';
                }
              }
            } catch (error) {
              console.log('Error checking connection for doctor:', doctor._id);
            }

            return {
              id: doctor._id,
              name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
              specialty: doctor.specialty || 'No specialty',
              rating: doctor.rating || 0,
              reviews: doctor.reviewCount || 0,
              hospital: doctor.hospital || 'Not specified',
              available: doctor.availableToday !== undefined ? doctor.availableToday : true,
              connectionStatus: connectionStatus,
              isVerified: doctor.isVerified
            };
          })
        );
        
        setDoctors(mappedDoctors);
      } else {
        console.error('❌ Failed to fetch doctors:', data.message);
        showAlert(data.message || 'Failed to fetch doctors', 'error');
      }
    } catch (error) {
      console.error('💥 Error fetching doctors:', error);
      showAlert('Error loading doctors. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const handleConnect = async (doctorId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        showAlert('Please login first', 'error');
        return;
      }

      console.log('🔗 Sending connection request to doctor:', doctorId);

      const response = await fetch(`${API_URL}/connections/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctorId,
          recordIds: []
        })
      });

      const data = await response.json();
      console.log('📡 Connection response:', data);

      if (data.success) {
        // Update UI to show pending state
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor.id === doctorId ? { ...doctor, connectionStatus: 'pending' } : doctor
          )
        );
        
        const doctor = doctors.find(d => d.id === doctorId);
        showAlert(`Connection request sent to ${doctor?.name}!`, 'success');
      } else {
        showAlert(data.message || 'Failed to send connection request', 'error');
      }
    } catch (error) {
      console.error('💥 Error sending connection request:', error);
      showAlert('Error sending connection request. Please try again.', 'error');
    }
  };

  const handleDisconnect = async (doctorId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        showAlert('Please login first', 'error');
        return;
      }

      // First, find the connection ID
      const checkResponse = await fetch(`${API_URL}/connections/check/${doctorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const checkData = await checkResponse.json();

      if (checkData.success && checkData.connection) {
        // Revoke the connection
        const revokeResponse = await fetch(`${API_URL}/connections/${checkData.connection._id}/revoke`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const revokeData = await revokeResponse.json();

        if (revokeData.success) {
          setDoctors(prevDoctors =>
            prevDoctors.map(doctor =>
              doctor.id === doctorId ? { ...doctor, connectionStatus: 'none' } : doctor
            )
          );
          
          const doctor = doctors.find(d => d.id === doctorId);
          showAlert(`Disconnected from ${doctor?.name}`, 'info');
        } else {
          showAlert(revokeData.message || 'Failed to disconnect', 'error');
        }
      }
    } catch (error) {
      console.error('💥 Error disconnecting:', error);
      showAlert('Error disconnecting. Please try again.', 'error');
    }
  };

  const handleBookAppointment = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    showAlert(`Booking appointment with ${doctor?.name}...`, 'info');
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Alert */}
      {alertVisible && (
        <View style={[
          styles.alertContainer, 
          alertType === 'success' ? styles.alertSuccess : 
          alertType === 'error' ? styles.alertError : 
          styles.alertInfo
        ]}>
          <View style={styles.alertContent}>
            <Ionicons 
              name={
                alertType === 'success' ? 'checkmark-circle' : 
                alertType === 'error' ? 'close-circle' :
                'information-circle'
              } 
              size={24} 
              color={
                alertType === 'success' ? '#059669' : 
                alertType === 'error' ? '#EF4444' :
                '#2563EB'
              } 
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
        >
          <Text style={styles.navTabText}>Messages</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No doctors found matching your search' : 'No doctors available'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchDoctors}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Doctor Cards */
          <View style={styles.doctorsContainer}>
            {filteredDoctors.map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                {/* Status Badge */}
                {doctor.connectionStatus === 'pending' && (
                  <View style={[styles.connectedBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="time-outline" size={14} color="#F59E0B" />
                    <Text style={[styles.connectedBadgeText, { color: '#F59E0B' }]}>Pending</Text>
                  </View>
                )}
                {doctor.connectionStatus === 'accepted' && (
                  <View style={styles.connectedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.connectedBadgeText}>Connected</Text>
                  </View>
                )}

                {/* Verified Badge */}
                {doctor.isVerified && (
                  <View style={[styles.connectedBadge, { 
                    top: doctor.connectionStatus !== 'none' ? 48 : 16, 
                    backgroundColor: '#DBEAFE' 
                  }]}>
                    <Ionicons name="shield-checkmark" size={14} color="#2563EB" />
                    <Text style={[styles.connectedBadgeText, { color: '#2563EB' }]}>Verified</Text>
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

                  {doctor.rating > 0 && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFA500" />
                      <Text style={styles.ratingText}>
                        {doctor.rating.toFixed(1)} ({doctor.reviews} reviews)
                      </Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{doctor.hospital}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={16} 
                      color={doctor.available ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={doctor.available ? styles.availableText : styles.unavailableText}>
                      {doctor.available ? 'Available Today' : 'Not Available'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  {doctor.connectionStatus === 'none' && (
                    <TouchableOpacity
                      style={styles.connectButton}
                      onPress={() => handleConnect(doctor.id)}
                    >
                      <Ionicons name="person-add-outline" size={18} color="#fff" />
                      <Text style={styles.connectButtonText}>Connect</Text>
                    </TouchableOpacity>
                  )}

                  {doctor.connectionStatus === 'pending' && (
                    <View style={styles.pendingButton}>
                      <Ionicons name="time-outline" size={18} color="#F59E0B" />
                      <Text style={styles.pendingButtonText}>Request Pending</Text>
                    </View>
                  )}

                  {doctor.connectionStatus === 'accepted' && (
                    <>
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => handleBookAppointment(doctor.id)}
                      >
                        <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                        <Text style={styles.bookButtonText}>Book Appointment</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={() => handleDisconnect(doctor.id)}
                      >
                        <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
                        <Text style={styles.disconnectButtonText}>Disconnect</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
  unavailableText: {
    fontSize: 14,
    color: '#EF4444',
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
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  pendingButtonText: {
    color: '#F59E0B',
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
  alertError: {
    backgroundColor: '#FEE2E2',
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