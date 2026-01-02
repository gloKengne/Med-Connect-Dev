import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_URL = 'http://192.168.1.165:5000/api'; // CHANGE THIS TO YOUR IP
const FS = FileSystem as any;

type DocumentType = 'lab_results' | 'imaging' | 'prescription' | 'clinical_notes' | 'vaccination_records' | 'others';

interface Document {
  _id: string;
  docTitle: string;
  docDate: string;
  description?: string;
  category: DocumentType;
  fileUrl: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export default function PatientDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentType>('lab_results');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchDocuments();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch(`${API_URL}/documents/my-documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getLastUpdated = () => {
    if (documents.length === 0) return 'No updates';
    
    const mostRecent = documents.reduce((latest, doc) => {
      const docDate = new Date(doc.updatedAt || doc.createdAt);
      const latestDate = new Date(latest.updatedAt || latest.createdAt);
      return docDate > latestDate ? doc : latest;
    });

    const lastUpdate = new Date(mostRecent.updatedAt || mostRecent.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        });
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const handleImagePicker = async () => {
    try {
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (mediaPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed to choose photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        });
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to access gallery');
    }
  };

  const handleDocumentPickerSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          type: file.mimeType || 'application/pdf',
          name: file.name || `document_${Date.now()}.pdf`,
        });
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to access files');
    }
  };

  const handleUploadChoice = () => {
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        { text: 'Take Photo', onPress: handleCamera },
        { text: 'Choose from Gallery', onPress: handleImagePicker },
        { text: 'Browse Files', onPress: handleDocumentPickerSelect },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const uploadDocument = async () => {
    if (!uploadTitle.trim()) {
      Alert.alert('Error', 'Please enter a document title');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);
      formData.append('docTitle', uploadTitle);
      formData.append('docDate', uploadDate);
      formData.append('description', uploadDescription);
      formData.append('category', uploadCategory);

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Document uploaded successfully!');
        closeUploadModal();
        fetchDocuments();
      } else {
        Alert.alert('Error', data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
    setUploadTitle('');
    setUploadCategory('lab_results');
    setUploadDescription('');
    setUploadDate(new Date().toISOString().split('T')[0]);
    setSelectedFile(null);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      Alert.alert('Downloading', 'Please wait...');

      const fileExtension = doc.fileUrl.split('.').pop();
      const fileUri = `${FS.documentDirectory}${doc.docTitle}.${fileExtension}`;

      const downloadResult = await FS.downloadAsync(doc.fileUrl, fileUri);

      if (downloadResult.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            dialogTitle: `Share ${doc.docTitle}`,
          });
        } else {
          Alert.alert('Success', 'File downloaded successfully!');
        }
      } else {
        Alert.alert('Error', 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const recentDocuments = documents.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="hospital-box" size={20} color="#2563eb" />
            <Text style={styles.logoText}>Med-Connect</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>
        </View>

        {/* Navigation */}
        {/* Navigation Tabs - Scrollable */}
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  style={styles.navigation}
  contentContainerStyle={styles.navigationContent}
>
  <TouchableOpacity 
    style={styles.navItemActive}
    onPress={() => router.push('/(tabs)/Patient/patient_dashboard')}
  >
    <Text style={styles.navText}>Dashboard</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => router.push('/(tabs)/Patient/records')}
  >
    <Text style={styles.navText}>My Records</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => router.push('/(tabs)/Patient/findDoctorsPage')}
  >
    <Text style={styles.navText}>Find Doctors</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => router.push('/(tabs)/Patient/appointmentPage')}
  >
    <Text style={styles.navText}>Appointments</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navItem}>
    <Text style={styles.navText}>Messages</Text>
  </TouchableOpacity>
</ScrollView>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.firstName || 'User'}
          </Text>
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
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statChange}>Last updated: {getLastUpdated()}</Text>
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
            <TouchableOpacity onPress={() => router.push('/(tabs)/Patient/records')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : recentDocuments.length === 0 ? (
            <Text style={styles.emptyText}>No documents yet. Upload your first document!</Text>
          ) : (
            recentDocuments.map((doc) => (
              <View key={doc._id} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Feather name="file-text" size={20} color="#2563eb" />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.docTitle}</Text>
                  <Text style={styles.documentCategory}>{doc.category.replace('_', ' ')}</Text>
                  <Text style={styles.documentDate}>{new Date(doc.docDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="eye" size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownloadDocument(doc)}
                  >
                    <Feather name="download" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardBlue]}
            onPress={handleUploadChoice}
          >
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

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeUploadModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={closeUploadModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Document Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Blood Test Results"
                  value={uploadTitle}
                  onChangeText={setUploadTitle}
                  editable={!uploading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryButtons}>
                  {[
                    { value: 'lab_results', label: 'Lab Results' },
                    { value: 'imaging', label: 'Imaging' },
                    { value: 'prescription', label: 'Prescription' },
                    { value: 'clinical_notes', label: 'Clinical Notes' },
                    { value: 'vaccination_records', label: 'Vaccination' },
                    { value: 'others', label: 'Others' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryButton,
                        uploadCategory === cat.value && styles.categoryButtonActive,
                      ]}
                      onPress={() => setUploadCategory(cat.value as DocumentType)}
                      disabled={uploading}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          uploadCategory === cat.value && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={uploadDate}
                  onChangeText={setUploadDate}
                  editable={!uploading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any additional notes..."
                  value={uploadDescription}
                  onChangeText={setUploadDescription}
                  multiline
                  numberOfLines={3}
                  editable={!uploading}
                />
              </View>

              {selectedFile && (
                <View style={styles.filePreview}>
                  <Ionicons name="document-attach" size={20} color="#2563eb" />
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.uploadModalBtn, uploading && styles.uploadModalBtnDisabled]}
                onPress={uploadDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <Text style={styles.uploadModalBtnText}>Upload Document</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Only new/modified styles
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  navigationContent: {
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
},
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
  uploadModalBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadModalBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  uploadModalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Keep all your existing styles here
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
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
  navigation: {
    flexDirection: 'row',
    gap: 4,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  navItemActive: {
    paddingVertical: 10,
    paddingHorizontal: 10,
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