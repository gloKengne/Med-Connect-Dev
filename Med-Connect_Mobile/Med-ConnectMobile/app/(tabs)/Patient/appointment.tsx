import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PatientHeader from './patient-header';


export default function AppointmentPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userData, setUserData] = useState({ firstName: '', lastName: '' });

  // 1. Fetch real user data for the Header initials
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserData({
            firstName: parsed.firstName || '',
            lastName: parsed.lastName || ''
          });
        }
      } catch (error) {
        console.error("Error loading user for header:", error);
      }
    };
    fetchUser();
  }, []);

  const handleCancelAction = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    setShowCancelModal(false);
    Alert.alert("Success", "Appointment cancelled successfully.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* THE PATIENT HEADER COMPONENT */}
      <PatientHeader 
        activeTab="Appointments" 
        firstName={userData.firstName} 
        lastName={userData.lastName} 
        unreadCount={2} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>My Appointments</Text>
          <Text style={styles.subtitleText}>Manage your healthcare appointments</Text>
        </View>

        {/* TOGGLE TABS */}
        <View style={styles.tabWrapper}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Upcoming' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Ionicons name="calendar" size={18} color={activeTab === 'Upcoming' ? '#fff' : '#6b7280'} />
            <Text style={[styles.tabLabel, activeTab === 'Upcoming' && styles.tabLabelActive]}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'Past' && styles.tabBtnActive]}
            onPress={() => setActiveTab('Past')}
          >
            <Ionicons name="time-outline" size={20} color={activeTab === 'Past' ? '#fff' : '#6b7280'} />
            <Text style={[styles.tabLabel, activeTab === 'Past' && styles.tabLabelActive]}>Past</Text>
          </TouchableOpacity>
        </View>

        {/* APPOINTMENT CARD */}
        <View style={styles.appointmentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={24} color="#2563eb" />
            </View>
            <View style={styles.doctorDetails}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.drNameText}>Dr. Emily Chen</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
              <Text style={styles.drSpecialtyText}>Cardiologist</Text>
            </View>
          </View>

          <View style={styles.dateTimeGrid}>
            <View style={styles.gridItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.gridText}>Sat, Nov 15, 2025</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.gridText}>10:00 AM</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text style={styles.gridText}>City Hospital</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.msgButton}>
              <Ionicons name="chatbubble-outline" size={18} color="#2563eb" />
              <Text style={styles.msgButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAction}>
              <Ionicons name="close-outline" size={20} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CANCELLATION MODAL */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Ionicons name="alert-circle" size={50} color="#ef4444" style={{marginBottom: 10}} />
            <Text style={styles.modalTitle}>Cancel Appointment?</Text>
            <Text style={styles.modalDesc}>Are you sure you want to cancel this visit? This cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.keepBtn} onPress={() => setShowCancelModal(false)}>
                <Text style={styles.keepBtnText}>No, Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmCancelBtn} onPress={confirmCancellation}>
                <Text style={styles.confirmCancelBtnText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  titleSection: { marginBottom: 20 },
  titleText: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  subtitleText: { fontSize: 15, color: '#64748b' },

  tabWrapper: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 5, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabLabel: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  tabLabelActive: { color: '#fff' },

  appointmentCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  doctorAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  
  // ADDED THIS SECTION TO FIX YOUR ERROR
  doctorDetails: { flex: 1 }, 
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  drNameText: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  drSpecialtyText: { fontSize: 14, color: '#64748b' },
  statusBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#059669' },

  dateTimeGrid: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingVertical: 15, gap: 10, marginBottom: 15 },
  gridItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gridText: { fontSize: 14, color: '#475569', fontWeight: '500' },

  buttonGroup: { flexDirection: 'row', gap: 12 },
  msgButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#2563eb', gap: 8 },
  msgButtonText: { color: '#2563eb', fontWeight: '700' },
  cancelButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#ef4444', gap: 8 },
  cancelButtonText: { color: '#ef4444', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBody: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  modalDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 25 },
  modalActions: { flexDirection: 'row', gap: 15, width: '100%' },
  keepBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  keepBtnText: { color: '#475569', fontWeight: '600' },
  confirmCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' },
  confirmCancelBtnText: { color: '#fff', fontWeight: '600' }
});