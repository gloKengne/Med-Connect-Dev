import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface DoctorHeaderProps {
  activeTab: 'Dashboard' | 'Patients' | 'Schedule' | 'Messages';
  unreadCount?: number;
  doctorName?: string;
}

interface DoctorHeaderProps {
  activeTab: 'Dashboard' | 'Patients' | 'Schedule' | 'Messages';
  unreadCount?: number;
  firstName?: string;
  lastName?: string;
}

export default function DoctorHeader({ activeTab, unreadCount = 0, firstName = "", lastName = "" }: DoctorHeaderProps) {
  const router = useRouter();

  const getInitials = () => {
    const fInitial = firstName ? firstName[0] : '';
    const lInitial = lastName ? lastName[0] : '';
    return (fInitial + lInitial).toUpperCase() || 'Dr';
  };

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', path: '/(tabs)/Doctor/doctor_dashboard' },
    { id: 'Patients', label: 'Patients', path: '/(tabs)/Doctor/doctor-patients' },
    { id: 'Schedule', label: 'Schedule', path: '/(tabs)/Doctor/schedule' }, // Ensure path exists
    { id: 'Messages', label: 'Messages', path: '/(tabs)/Doctor/messages' },
  ];

  return (
    <View style={styles.headerWrapper}>
      {/* HEADER TOP */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
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

      {/* NAVIGATION BAR */}
      <View style={styles.navContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navContent}
        >
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={activeTab === item.id ? styles.navTabActive : styles.navTab}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={activeTab === item.id ? styles.navTextActive : styles.navText}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: { backgroundColor: '#fff', paddingTop: 40 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  logoIcon: { fontSize: 28, fontWeight: '700', color: '#fff' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginLeft: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  notificationBtn: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  navContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 50 },
  navContent: { paddingHorizontal: 20, alignItems: 'center' },
  navTab: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navTabActive: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  navText: { fontSize: 16, fontWeight: '400', color: '#9CA3AF' },
  navTextActive: { fontSize: 16, fontWeight: '500', color: '#2563EB' },
});