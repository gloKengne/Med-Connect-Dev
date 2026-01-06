import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Define the shape of an appointment with patient details
interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  location?: string;
  patient: {
    firstName: string;
    lastName: string;
    email?: string;
  };
}

const API_URL = "http://192.168.1.165:5000/api"; 

export default function DoctorSchedulePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming' or 'Past/Cancelled'
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorSchedule();
  }, []);

  const fetchDoctorSchedule = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      // Fetching all appointments for this doctor
      const response = await fetch(`${API_URL}/appointments/doctor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      Alert.alert("Error", "Could not load your schedule");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic: 
  // Upcoming = Confirmed + Date in future
  // Past = Cancelled, Rejected, or Date in past
  const filteredAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.date);
    const isPast = apptDate < new Date();
    
    if (activeTab === 'Upcoming') {
      return appt.status === 'confirmed' && !isPast;
    } else {
      // Show cancelled, rejected, and finished appointments here
      return appt.status === 'cancelled' || appt.status === 'rejected' || isPast;
    }
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#ecfdf5', text: '#059669' }; // Green
      case 'cancelled':
      case 'rejected': return { bg: '#fef2f2', text: '#ef4444' }; // Red
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching patient style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Doctor/doctor_dashboard')}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity onPress={fetchDoctorSchedule}>
          <Ionicons name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Daily Appointments</Text>
          <Text style={styles.subtitleText}>Manage your patient visits and cancellations</Text>
        </View>

        {/* TABS (Styled like Patient Page) */}
        <View style={styles.tabWrapper}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Upcoming' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Ionicons name="calendar" size={18} color={activeTab === 'Upcoming' ? '#fff' : '#6b7280'} />
            <Text style={[styles.tabLabel, activeTab === 'Upcoming' && styles.tabLabelActive]}>Confirmed</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Past' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Past')}
          >
            <Ionicons name="archive-outline" size={18} color={activeTab === 'Past' ? '#fff' : '#6b7280'} />
            <Text style={[styles.tabLabel, activeTab === 'Past' && styles.tabLabelActive]}>History/Cancelled</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>No appointments found in this section.</Text>
          </View>
        ) : (
          filteredAppointments.map((appt) => (
            <View key={appt._id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.avatarText}>
                    {appt.patient.firstName[0]}{appt.patient.lastName[0]}
                  </Text>
                </View>
                <View style={styles.patientDetails}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={styles.pNameText}>{appt.patient.firstName} {appt.patient.lastName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(appt.status).bg }]}>
                      <Text style={[styles.statusText, { color: getStatusStyle(appt.status).text }]}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pContactText}>{appt.patient.email || 'No email provided'}</Text>
                </View>
              </View>

              <View style={styles.dateTimeGrid}>
                <View style={styles.gridItem}>
                  <Ionicons name="calendar-outline" size={16} color="#64748b" />
                  <Text style={styles.gridText}>{new Date(appt.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Ionicons name="time-outline" size={16} color="#64748b" />
                  <Text style={styles.gridText}>{appt.startTime}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Ionicons name="location-outline" size={16} color="#64748b" />
                  <Text style={styles.gridText}>{appt.location || 'Clinic Visit'}</Text>
                </View>
              </View>

              {appt.status === 'confirmed' && (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.msgButton}>
                    <Ionicons name="chatbubble-outline" size={18} color="#2563eb" />
                    <Text style={styles.msgButtonText}>Message Patient</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  scrollContent: { padding: 20 },
  titleSection: { marginBottom: 20 },
  titleText: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  subtitleText: { color: '#64748b', fontSize: 14, marginTop: 4 },
  tabWrapper: { 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 20 
  },
  tabBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10, 
    borderRadius: 10, 
    gap: 8 
  },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabLabel: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabLabelActive: { color: '#fff' },
  appointmentCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  patientAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    backgroundColor: '#eff6ff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  patientDetails: { flex: 1, marginLeft: 12 },
  nameBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pNameText: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '800' },
  pContactText: { color: '#64748b', fontSize: 13, marginTop: 2 },
  dateTimeGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderBottomWidth: 1, 
    borderColor: '#f1f5f9',
    marginBottom: 12
  },
  gridItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gridText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  msgButton: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#eff6ff', 
    gap: 8 
  },
  msgButtonText: { color: '#2563eb', fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 16 }
});