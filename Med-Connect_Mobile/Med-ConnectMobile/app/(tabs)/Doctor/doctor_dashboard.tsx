// Updated DoctorDashboard.tsx - Replace the existing file with this
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api'; // Replace with your actual backend URL

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  iconColor: string;
}

interface QuickActionCardProps {
  title: string;
  icon: string;
  iconColor: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
);

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, icon, iconColor, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={[styles.actionIconContainer, { backgroundColor: `${iconColor}15` }]}>
      <Ionicons name={icon as any} size={28} color={iconColor} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function DoctorDashboard() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
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
        <TouchableOpacity style={styles.navTabActive}>
          <Text style={styles.navTabTextActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Doctor/doctor-patients')}
        >
          <Text style={styles.navTabText}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navTabText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navTabText}>Messages</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome, Dr. Patricia</Text>
          <Text style={styles.subtitle}>Here's your dashboard overview</Text>
        </View>

        {/* Notification Alert if there are pending requests */}
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.notificationAlert}
            onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="notifications" size={24} color="#2563EB" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                You have {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSubtitle}>Tap to view connection requests</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        )}

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Patients"
              value="142"
              subtitle="+8 this month"
              icon="people-outline"
              iconColor="#2563EB"
            />
            <StatCard
              title="Today's Appointments"
              value="12"
              subtitle="3 remaining"
              icon="calendar-outline"
              iconColor="#06B6D4"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Pending Reviews"
              value="7"
              subtitle="Lab results & imaging"
              icon="document-text-outline"
              iconColor="#EC4899"
            />
            <StatCard
              title="Active Consultations"
              value="4"
              subtitle="In progress"
              icon="videocam-outline"
              iconColor="#8B5CF6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <QuickActionCard
              title="View Patients"
              icon="people-outline"
              iconColor="#2563EB"
              onPress={() => router.push('/(tabs)/Doctor/doctor-patients')}
            />
            <QuickActionCard
              title="Notifications"
              icon="notifications-outline"
              iconColor="#F59E0B"
              onPress={() => router.push('/(tabs)/Doctor/DoctorNotificationPage')}
            />
            <QuickActionCard
              title="Messages"
              icon="chatbubbles-outline"
              iconColor="#06B6D4"
            />
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="person-add-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>New patient registered</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Appointment completed</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Lab results received</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
          </View>
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
  notificationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 120,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});