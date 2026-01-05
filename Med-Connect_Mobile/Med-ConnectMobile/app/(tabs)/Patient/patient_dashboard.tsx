import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PatientHeader from './patient-header';

const API_URL = 'http://192.168.1.165:5000/api';

// ==================== INTERFACES ====================
interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface DashboardStats {
  connectedDoctors: number;
  totalDocuments: number;
  upcomingAppointments: number;
  lastUpdated: string;
}

interface Document {
  _id: string;
  docTitle: string;
  docDate: string;
  category: string;
  fileUrl: string;
}

// ==================== MAIN COMPONENT ====================
export default function PatientDashboard() {
  // ========== STATE ==========
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    connectedDoctors: 0,
    totalDocuments: 0,
    upcomingAppointments: 0,
    lastUpdated: ''
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // ========== EFFECTS ==========
  useEffect(() => {
    initializeDashboard();
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== API CALLS ==========
  const initializeDashboard = async () => {
    await Promise.all([
      fetchUserData(),
      fetchDashboardStats(),
      fetchDocuments()
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
      setStatsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/dashboard/patient/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/documents/my-documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data.slice(0, 4)); // Only recent 4
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
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
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getLastUpdated = () => {
    if (!stats.lastUpdated) return 'No updates';
    
    const lastUpdate = new Date(stats.lastUpdated);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // ========== RENDER ==========
  return (
    <View style={styles.container}><PatientHeader activeTab="Dashboard" unreadCount={5}/>
      

      {/* MAIN CONTENT */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* WELCOME SECTION */}
        <View style={styles.section}>
          <Text style={styles.title}>Welcome back, {user?.firstName || 'User'}</Text>
          <Text style={styles.subtitle}>Here's an overview of your health information</Text>
        </View>

        {/* STATS CARDS */}
        {statsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Total Documents</Text>
                  <View style={styles.iconContainer}>
                    <Feather name="file-text" size={20} color="#2563eb" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.totalDocuments}</Text>
                <Text style={styles.statSubtext}>Last updated: {getLastUpdated()}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Connected Doctors</Text>
                  <View style={styles.iconContainer}>
                    <Feather name="users" size={20} color="#2563eb" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.connectedDoctors}</Text>
                <Text style={styles.statSubtext}>Active connections</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Appointments</Text>
                  <View style={styles.iconContainer}>
                    <Feather name="calendar" size={20} color="#10b981" />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.upcomingAppointments}</Text>
                <Text style={styles.statGood}>Upcoming</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Health Score</Text>
                  <View style={styles.iconContainer}>
                    <Feather name="activity" size={20} color="#10b981" />
                  </View>
                </View>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statGood}>Good</Text>
              </View>
            </View>
          </>
        )}

        {/* RECENT DOCUMENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Documents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Patient/records')}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : documents.length === 0 ? (
            <Text style={styles.emptyText}>No documents yet</Text>
          ) : (
            documents.map((doc) => (
              <View key={doc._id} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <Feather name="file-text" size={20} color="#2563eb" />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.docTitle}</Text>
                  <Text style={styles.docCategory}>{doc.category.replace('_', ' ')}</Text>
                  <Text style={styles.docDate}>
                    {new Date(doc.docDate).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity style={styles.docAction}>
                  <Feather name="download" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Feather name="upload" size={20} color="#2563eb" />
            </View>
            <Text style={styles.actionText}>Upload Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Feather name="calendar" size={20} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/Patient/findDoctorsPage')}
          >
            <View style={styles.actionIcon}>
              <Feather name="search" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>Find Doctor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  
  // HEADER
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
  
  // NAVIGATION
  navContent: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', paddingBottom: 0 },
  navItem: { paddingVertical: 12, paddingHorizontal: 16 },
  navItemActive: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  navText: { fontSize: 14, color: '#6b7280' },
  navTextActive: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  
  // CONTENT
  content: { flex: 1 },
  section: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  
  // STATS
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { fontSize: 12, color: '#6b7280', flex: 1 },
  iconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 4 },
  statSubtext: { fontSize: 12, color: '#6b7280' },
  statGood: { fontSize: 12, color: '#10b981' },
  
  // DOCUMENTS
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  viewAll: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingVertical: 20 },
  docCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  docIcon: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  docCategory: { fontSize: 13, color: '#2563eb', marginBottom: 2, textTransform: 'capitalize' },
  docDate: { fontSize: 12, color: '#9ca3af' },
  docAction: { padding: 8 },
  
  // ACTIONS
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  actionIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { fontSize: 15, fontWeight: '600', color: '#111827' },
});