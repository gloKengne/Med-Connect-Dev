import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure this matches your backend server IP
const API_URL = 'http://192.168.1.165:5000/api';

interface MedicalRecord {
  _id: string;
  docTitle: string;
  docDate: string;
  description: string;
  category: string;
  fileUrl: string;
}

export default function PatientRecordsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Data passed from the DoctorPatientsPage
  const { patientId, patientName, age, condition, gender } = params;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientRecords();
  }, [patientId]);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      /** * REUSED API LOGIC:
       * We use the patient's standard route but pass the patientId in the query string.
       * This avoids "Unmatched Route" errors because /my-documents already exists.
       */
      const url = `${API_URL}/documents/my-documents?patientId=${patientId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Checking for the 'success' flag and the 'documents' array from your controller
      if (data.success) {
        setRecords(data.documents);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecordItem = (item: MedicalRecord) => {
    const formatCategory = (cat: string) => {
      if (!cat) return 'Other';
      return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
      <TouchableOpacity key={item._id} style={styles.recordCard}>
        <View style={styles.recordIconContainer}>
          <Ionicons 
            name={item.category === 'prescription' ? "medical" : "document-text"} 
            size={24} 
            color="#2563EB" 
          />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{item.docTitle}</Text>
          <Text style={styles.recordMeta}>
            {formatCategory(item.category)} • {new Date(item.docDate).toLocaleDateString()}
          </Text>
          {item.description ? (
            <Text style={styles.recordDescription} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Summary Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.profileName}>{patientName}</Text>
              <Text style={styles.profileSub}>
                {gender} • {age && Number(age) > 0 ? `${age} years old` : 'Age not specified'}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.medicationSection}>
            <Text style={styles.sectionLabel}>ACTIVE MEDICATIONS / CONDITIONS</Text>
            <View style={styles.conditionBadge}>
              <Ionicons name="alert-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.conditionText}>
                {condition && condition !== 'No illness' ? condition : 'No current medication'}
              </Text>
            </View>
          </View>
        </View>

        {/* Records List Section */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Uploaded Documents</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : records.length > 0 ? (
            records.map((record) => renderRecordItem(record))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No files available</Text>
              <Text style={styles.emptyStateSubtext}>
                Documents uploaded by the patient will appear here automatically.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  content: { flex: 1, padding: 16 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  profileSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  medicationSection: { gap: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1 },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  conditionText: { color: '#1E40AF', fontWeight: '600', fontSize: 14 },
  listSection: { flex: 1 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  recordMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  recordDescription: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});