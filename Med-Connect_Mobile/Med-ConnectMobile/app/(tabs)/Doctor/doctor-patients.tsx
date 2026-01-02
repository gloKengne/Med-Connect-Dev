// DoctorPatientsPage.tsx - DYNAMIC VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  status: 'Active' | 'Inactive';
  email?: string;
  phone?: string;
}

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchPatients();
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.error('❌ No token found');
        setLoading(false);
        return;
      }

      console.log('📋 Fetching connected patients...');

      const response = await fetch(`${API_URL}/connections/doctor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📦 Patients data:', data);

      if (data.success) {
        // Map the connections to patient format
        const mappedPatients: Patient[] = data.connections.map((connection: any) => {
          const patient = connection.patient;
          
          // Calculate age from dateOfBirth
          let age = 0;
          if (patient.dateOfBirth) {
            const birthDate = new Date(patient.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          // Format last visit date
          const lastVisit = new Date(connection.createdAt).toISOString().split('T')[0];

          return {
            id: patient._id,
            name: `${patient.firstName} ${patient.lastName}`,
            age: age || 0,
            gender: patient.gender || 'Not specified',
            condition: patient.medicalHistory?.currentMedications?.[0] || 'No illness',
            lastVisit: lastVisit,
            status: 'Active',
            email: patient.email,
            phone: patient.phone,
          };
        });

        setPatients(mappedPatients);
        console.log('✅ Loaded patients:', mappedPatients.length);
      } else {
        console.error('❌ Failed to fetch patients:', data.message);
      }
    } catch (error) {
      console.error('💥 Error fetching patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients();
    fetchUnreadCount();
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && patient.status === 'Active') ||
                         (selectedFilter === 'inactive' && patient.status === 'Inactive');
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationContainer}
            onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
          >
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>D</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.navContainer}
        contentContainerStyle={styles.navContent}
      >
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Doctor/doctor_dashboard')}
        >
          <Text style={styles.navTabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTabActive}>
          <Text style={styles.navTabTextActive}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navTabText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navTabText}>Messages</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Patient Directory</Text>
            <Text style={styles.subtitle}>
              {patients.length} connected patient{patients.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search patients by name or condition..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#2563EB" />
              <Text style={styles.filterText}>Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
                All Patients ({patients.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'active' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('active')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'active' && styles.filterTabTextActive]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'inactive' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('inactive')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'inactive' && styles.filterTabTextActive]}>
                Inactive
              </Text>
            </TouchableOpacity>
          </View>

          {/* Patient List */}
          {filteredPatients.length > 0 ? (
            <View style={styles.patientsContainer}>
              {filteredPatients.map((patient) => (
                <View key={patient.id} style={styles.patientCard}>
                  {/* Patient Avatar and Info */}
                  <View style={styles.patientHeader}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={28} color="#2563EB" />
                      </View>
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientDetails}>
                        {patient.age > 0 ? `${patient.age} years old` : 'Age not specified'} • {patient.gender}
                      </Text>
                      <View style={styles.conditionRow}>
                        <Ionicons name="medical-outline" size={14} color="#6B7280" />
                        <Text style={styles.conditionText}>{patient.condition}</Text>
                      </View>
                      <View style={styles.visitRow}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.visitText}>Connected: {patient.lastVisit}</Text>
                      </View>
                    </View>
                    <View style={styles.statusBadgeContainer}>
                      <View style={[
                        styles.statusBadge, 
                        patient.status === 'Active' ? styles.statusActive : styles.statusInactive
                      ]}>
                        <Text style={[
                          styles.statusText,
                          patient.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive
                        ]}>
                          {patient.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.viewRecordsButton}>
                      <Ionicons name="eye-outline" size={18} color="#2563EB" />
                      <Text style={styles.viewRecordsText}>View Records</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                      <Text style={styles.messageButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* Empty State */
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No patients found' : 'No connected patients yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery 
                  ? 'Try adjusting your search' 
                  : 'Patients will appear here once they connect with you'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationContainer: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
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
    marginBottom: 16,
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 6,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  patientsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  conditionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visitText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadgeContainer: {
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextInactive: {
    color: '#DC2626',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewRecordsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  viewRecordsText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});