// App.tsx (or App.js with JSDoc comments)
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

// Type definitions
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  iconBg: string;
}

interface QuickActionCardProps {
  title: string;
  icon: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBg }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
);

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, icon, iconBg }) => (
  <TouchableOpacity style={styles.actionCard}>
    <View style={[styles.actionIconContainer, { backgroundColor: iconBg }]}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>❤️</Text>
            </View>
            <Text style={styles.logoText}>Med-Connect</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.notificationBadge}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.badge} />
            </View>
            <View style={styles.profileContainer}>
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>D</Text>
              </View>
              <Text style={styles.profileName}>Dr. Patricia</Text>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navItemActive}>
            <Text style={styles.navTextActive}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Patients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, Dr. Patricia</Text>
          <Text style={styles.welcomeSubtitle}>Here's your dashboard overview</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="TOTAL PATIENTS"
            value="142"
            subtitle="+8 this month"
            icon="👥"
            iconBg="#E3F2FD"
          />
          <StatCard
            title="TODAY'S APPOINTMENTS"
            value="12"
            subtitle="3 remaining"
            icon="📅"
            iconBg="#E0F7FA"
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="PENDING REVIEWS"
            value="7"
            subtitle="Lab results & imaging"
            icon="⭐"
            iconBg="#FCE4EC"
          />
          <StatCard
            title="ACTIVE CONSULTATIONS"
            value="4"
            subtitle="In progress"
            icon="🎥"
            iconBg="#E8EAF6"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <QuickActionCard
              title="View Patients"
              icon="👥"
              iconBg="#E3F2FD"
            />
            <QuickActionCard
              title="Schedule"
              icon="📅"
              iconBg="#E0F7FA"
            />
            <QuickActionCard
              title="Messages"
              icon="💬"
              iconBg="#FFF9C4"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
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
  notificationBadge: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  nav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 24,
  },
  navItem: {
    paddingVertical: 12,
  },
  navItemActive: {
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#2196F3',
  },
  navText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  navTextActive: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 36,
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 120,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});