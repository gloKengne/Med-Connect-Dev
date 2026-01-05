import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorHeader from './doctor-header';

const API_URL = 'http://192.168.1.165:5000/api';

// ==================== INTERFACES ====================
interface DoctorStats {
  totalPatients: number;
  pendingReviews: number;
  todayAppointments: number;
  activeConsultations: number;
  lastUpdated: string;
}

interface User {
  firstName: string;
  lastName: string;
}

// ==================== MAIN COMPONENT ====================
export default function DoctorDashboard() {
  // ========== STATE ==========
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    pendingReviews: 0,
    todayAppointments: 0,
    activeConsultations: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // ========== EFFECTS ==========
  useEffect(() => {
    initializeDashboard();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ========== API CALLS ==========
  const initializeDashboard = async () => {
    await Promise.all([
      fetchUserData(),
      fetchDashboardStats()
    ]);
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/dashboard/doctor/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📊 Doctor stats:', data);

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const getInitials = () => {
    if (!user) return 'D';
    return user.firstName?.charAt(0).toUpperCase() || 'D';
  };

  const getNewPatientsText = () => {
    const newPatients = Math.floor(stats.totalPatients * 0.06);
    return stats.totalPatients > 0 ? `+${newPatients} this month` : 'No patients yet';
  };

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <DoctorHeader activeTab="Dashboard" unreadCount={2} doctorName="Jack Ling" />

      {/* MAIN CONTENT */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* WELCOME */}
        <View style={styles.section}>
          <Text style={styles.title}>Welcome, Dr. {user?.firstName || 'Doctor'}</Text>
          <Text style={styles.subtitle}>Here's your dashboard overview</Text>
        </View>

        {/* NOTIFICATION ALERT */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.alert}
            onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="notifications" size={24} color="#2563EB" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSubtext}>Tap to view</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        )}

        {/* STATS GRID */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              {/* TOTAL PATIENTS */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>TOTAL PATIENTS</Text>
                  <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="people-outline" size={24} color="#2563EB" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.totalPatients}</Text>
                <Text style={styles.statSubtext}>{getNewPatientsText()}</Text>
              </View>

              {/* TODAY'S APPOINTMENTS */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>TODAY'S APPTS</Text>
                  <View style={[styles.iconBox, { backgroundColor: '#ECFEFF' }]}>
                    <Ionicons name="calendar-outline" size={24} color="#06B6D4" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.todayAppointments}</Text>
                <Text style={styles.statSubtext}>
                  {Math.max(0, stats.todayAppointments - 3)} remaining
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {/* PENDING REVIEWS */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>PENDING REVIEWS</Text>
                  <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
                    <Ionicons name="document-text-outline" size={24} color="#EC4899" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.pendingReviews}</Text>
                <Text style={styles.statSubtext}>
                  {stats.pendingReviews > 0 ? 'Patient documents' : 'All caught up!'}
                </Text>
              </View>

              {/* ACTIVE CONSULTATIONS */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>CONSULTATIONS</Text>
                  <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="videocam-outline" size={24} color="#8B5CF6" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.activeConsultations}</Text>
                <Text style={styles.statSubtext}>In progress</Text>
              </View>
            </View>
          </>
        )}

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/Doctor/doctor-patients')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="people-outline" size={28} color="#2563EB" />
              </View>
              <Text style={styles.actionTitle}>View Patients</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="notifications-outline" size={28} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconBox, { backgroundColor: '#ECFEFF' }]}>
                <Ionicons name="chatbubbles-outline" size={28} color="#06B6D4" />
              </View>
              <Text style={styles.actionTitle}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityCard}>
            {stats.totalPatients > 0 ? (
              <>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIconBox, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="person-add-outline" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{stats.totalPatients} connected patients</Text>
                    <Text style={styles.activityTime}>Active connections</Text>
                  </View>
                </View>

                {stats.pendingReviews > 0 && (
                  <View style={styles.activityItem}>
                    <View style={[styles.activityIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="document-outline" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{stats.pendingReviews} documents to review</Text>
                      <Text style={styles.activityTime}>From patients</Text>
                    </View>
                  </View>
                )}

                <View style={styles.activityItem}>
                  <View style={[styles.activityIconBox, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Dashboard synced</Text>
                    <Text style={styles.activityTime}>Just now</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No activity yet</Text>
                <Text style={styles.emptySubtext}>Connect with patients to see activity</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // HEADER
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
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

  // NAVIGATION
  navContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', maxHeight: 50 },
  navContent: { paddingHorizontal: 20, alignItems: 'center' },
  navTab: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navTabActive: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  navText: { fontSize: 16, fontWeight: '400', color: '#9CA3AF' },
  navTextActive: { fontSize: 16, fontWeight: '500', color: '#2563EB' },

  // CONTENT
  content: { flex: 1 },
  section: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280' },

  // ALERT
  alert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  alertIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  alertSubtext: { fontSize: 13, color: '#6B7280' },

  // STATS
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 140 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  statSubtext: { fontSize: 14, color: '#6B7280' },

  // ACTIONS
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', minHeight: 120 },
  actionIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },

  // ACTIVITY
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAll: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  activityCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '500', color: '#1F2937', marginBottom: 2 },
  activityTime: { fontSize: 13, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
});