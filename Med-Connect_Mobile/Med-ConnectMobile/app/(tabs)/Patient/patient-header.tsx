import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PatientHeaderProps {
  activeTab: 'Dashboard' | 'Records' | 'FindDoctors' | 'Messages' | 'Appointments';
  unreadCount?: number;
  firstName?: string;
  lastName?: string;
}

export default function PatientHeader({ activeTab, unreadCount = 0, firstName = "", lastName = "" }: PatientHeaderProps) {
  const router = useRouter();

  // Optimized initials logic using your specific DB fields
  const getInitials = () => {
    const fInitial = firstName ? firstName[0] : '';
    const lInitial = lastName ? lastName[0] : '';
    return (fInitial + lInitial).toUpperCase() || 'U';
  };

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', path: '/(tabs)/Patient/patient_dashboard' },
    { id: 'Records', label: 'My Records', path: '/(tabs)/Patient/records' },
    { id: 'FindDoctors', label: 'Find Doctors', path: '/(tabs)/Patient/findDoctorsPage' },
    { id: 'Messages', label: 'Messages', path: '/(tabs)/Patient/messages' },
    { id: 'Appointments', label: 'Appointments', path: '/(tabs)/Patient/appointmentPage' },
  ];

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="hospital-box" size={20} color="#2563eb" />
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => router.push('/(tabs)/Patient/patientNotification')}
          >
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navContent}>
        {navItems.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={activeTab === item.id ? styles.navItemActive : styles.navItem}
            onPress={() => router.push(item.path as any)}
          >
            <Text style={activeTab === item.id ? styles.navTextActive : styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', paddingTop: 40, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationBtn: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  navContent: { paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center' },
  navItem: { paddingVertical: 12, paddingHorizontal: 16 },
  navItemActive: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  navText: { fontSize: 14, color: '#6b7280' },
  navTextActive: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
});