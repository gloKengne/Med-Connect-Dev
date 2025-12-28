import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PatientDashboard() {
  const documents = [
    { id: 1, title: 'Blood Test Results', category: 'Lab Results', date: '2025-11-08', icon: 'file-text' },
    { id: 2, title: 'Chest X-Ray', category: 'Imaging', date: '2025-11-05', icon: 'file-text' },
    { id: 3, title: 'Prescription Amoxicillin', category: 'Prescription', date: '2025-11-03', icon: 'file-text' },
    { id: 4, title: "Doctor's Notes - Checkup", category: 'Clinical Notes', date: '2025-10-30', icon: 'file-text' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="hospital-box" size={24} color="#2563eb" />
            <Text style={styles.logoText}>Med-Connect</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={styles.avatar} />
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItemActive}>
            <Text style={styles.navTextActive}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/Patient/records')} style={styles.navItem}>
            <Text style={styles.navText}>My Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Find Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Appointments</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>Welcome back, Sarah</Text>
          <Text style={styles.welcomeSubtitle}>Here's an overview of your health information</Text>
        </View>

        {/* Stats Cards Row 1 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Documents</Text>
              <View style={styles.statIconContainer}>
                <Feather name="file-text" size={20} color="#2563eb" />
              </View>
            </View>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statChange}>+3 this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Connected Doctors</Text>
              <View style={styles.statIconContainer}>
                <Feather name="users" size={20} color="#2563eb" />
              </View>
            </View>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statSubtext}>2 active</Text>
          </View>
        </View>

        {/* Stats Cards Row 2 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Upcoming Appointments</Text>
              <View style={styles.statIconContainer}>
                <Feather name="calendar" size={20} color="#2563eb" />
              </View>
            </View>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statChange}>Next: Nov 15</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Health Score</Text>
              <View style={styles.statIconContainer}>
                <Feather name="activity" size={20} color="#10b981" />
              </View>
            </View>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statGood}>Good condition</Text>
          </View>
        </View>

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="file-text" size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Recent Documents</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {documents.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Feather name="file-text" size={20} color="#2563eb" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentCategory}>{doc.category}</Text>
                <Text style={styles.documentDate}>{doc.date}</Text>
              </View>
              <View style={styles.documentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="eye" size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="download" size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="more-vertical" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Health Summary */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Feather name="activity" size={18} color="#374151" />
            <Text style={styles.sectionTitle}>Health Summary</Text>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIconContainer}>
              <Feather name="droplet" size={20} color="#2563eb" />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Blood Type</Text>
              <Text style={styles.healthValue}>O+</Text>
            </View>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIconContainerAlert}>
              <Feather name="alert-circle" size={20} color="#ef4444" />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Allergies</Text>
              <View style={styles.allergyContainer}>
                <Text style={styles.healthValue}>Penicillin, Pollen</Text>
                <View style={styles.importantBadge}>
                  <Text style={styles.importantText}>Important</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIconContainer}>
              <Feather name="package" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Current Medications</Text>
              <Text style={styles.healthValue}>3 prescriptions</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardBlue]}>
            <View style={styles.actionIconContainer}>
              <Feather name="upload" size={20} color="#2563eb" />
            </View>
            <Text style={styles.actionCardText}>Upload New Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardGreen]}>
            <View style={styles.actionIconContainerGreen}>
              <Feather name="calendar" size={20} color="#10b981" />
            </View>
            <Text style={styles.actionCardText}>Schedule Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, styles.actionCardPurple]}>
            <View style={styles.actionIconContainerPurple}>
              <Feather name="search" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.actionCardText}>Find a Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Health Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Health Tip of the Day</Text>
            <Text style={styles.tipText}>
              Stay hydrated! Drinking adequate water helps maintain healthy organ function and improves overall well-being.
            </Text>
            <TouchableOpacity style={styles.tipButton}>
              <Text style={styles.tipButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
  },
  navigation: {
    flexDirection: 'row',
    gap: 4,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  navItemActive: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  navText: {
    fontSize: 13,
    color: '#6b7280',
  },
  navTextActive: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#2563eb',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  statGood: {
    fontSize: 12,
    color: '#10b981',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentCategory: {
    fontSize: 13,
    color: '#2563eb',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  healthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthIconContainerAlert: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthInfo: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  allergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importantBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  importantText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionCardBlue: {
    backgroundColor: '#eff6ff',
  },
  actionCardGreen: {
    backgroundColor: '#d1fae5',
  },
  actionCardPurple: {
    backgroundColor: '#f3e8ff',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIconContainerGreen: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIconContainerPurple: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  tipCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});