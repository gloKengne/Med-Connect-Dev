import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import DocumentViewer from '@/components/DocumentViewer'; // Import the DocumentViewer component

// Replace with your computer's IP address
const API_URL = 'http://192.168.1.i:5000/api'; // CHANGE THIS TO YOUR IP

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
}

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  // Document Viewer State
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentType>('lab_results');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please login first');
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
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const getCardStyle = (type: DocumentType) => {
    switch (type) {
      case 'lab_results':
        return {
          borderColor: '#3b82f6',
          iconBg: '#eff6ff',
          iconColor: '#3b82f6',
          categoryLabel: 'LAB RESULTS',
        };
      case 'imaging':
        return {
          borderColor: '#06b6d4',
          iconBg: '#ecfeff',
          iconColor: '#06b6d4',
          categoryLabel: 'IMAGING',
        };
      case 'prescription':
        return {
          borderColor: '#f97316',
          iconBg: '#fff7ed',
          iconColor: '#f97316',
          categoryLabel: 'PRESCRIPTION',
        };
      case 'clinical_notes':
        return {
          borderColor: '#a855f7',
          iconBg: '#faf5ff',
          iconColor: '#a855f7',
          categoryLabel: 'CLINICAL NOTES',
        };
      case 'vaccination_records':
        return {
          borderColor: '#10b981',
          iconBg: '#d1fae5',
          iconColor: '#10b981',
          categoryLabel: 'VACCINATION',
        };
      default:
        return {
          borderColor: '#64748b',
          iconBg: '#f1f5f9',
          iconColor: '#64748b',
          categoryLabel: 'OTHERS',
        };
    }
  };

  const openUploadModal = () => {
    setUploadModalVisible(true);
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
    // Reset form
    setUploadTitle('');
    setUploadCategory('lab_results');
    setUploadDescription('');
    setUploadDate(new Date().toISOString().split('T')[0]);
    setSelectedFile(null);
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
        openUploadModal();
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
        openUploadModal();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to access gallery');
    }
  };

  const handleDocumentPicker = async () => {
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
        openUploadModal();
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
        { text: 'Browse Files', onPress: handleDocumentPicker },
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

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${docTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              
              const response = await fetch(`${API_URL}/documents/${docId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Success', 'Document deleted successfully');
                fetchDocuments();
              } else {
                Alert.alert('Error', data.error || 'Failed to delete document');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewerVisible(true);
  };

  const handleDocumentPress = (doc: Document) => {
    Alert.alert(
      doc.docTitle,
      `Category: ${getCardStyle(doc.category).categoryLabel}\nDate: ${new Date(doc.docDate).toLocaleDateString()}\n\n${doc.description || 'No description'}`,
      [
        { text: 'View', onPress: () => handleViewDocument(doc) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteDocument(doc._id, doc.docTitle) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.docTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="hospital-box" size={24} color="#fff" />
          </View>
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>
        
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#1a1a1a" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userAvatar} />
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/Patient/patient_dashboard')}
        >
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <Text style={styles.navTextActive}>My Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Find Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Appointments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>My Medical Records</Text>
          <Text style={styles.pageSubtitle}>
            Manage and organize all your health documents
          </Text>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadContent}>
            <Text style={styles.uploadTitle}>Upload New Document</Text>
            <Text style={styles.uploadDescription}>
              Add lab results, prescriptions, imaging reports, or any medical
              document to your digital booklet.
            </Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadChoice}>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.uploadBtnText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.uploadIllustration}>
            <Ionicons name="document-text" size={48} color="#fff" />
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchFilterSection}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#94a3b8"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Documents Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : filteredDocuments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No documents found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Upload your first document to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.documentsGrid}>
            {filteredDocuments.map((doc) => {
              const cardStyle = getCardStyle(doc.category);
              return (
                <TouchableOpacity
                  key={doc._id}
                  style={[
                    styles.documentCard,
                    { borderTopColor: cardStyle.borderColor },
                  ]}
                  onPress={() => handleDocumentPress(doc)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.documentIcon,
                      { backgroundColor: cardStyle.iconBg },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color={cardStyle.iconColor}
                    />
                  </View>

                  <Text style={styles.documentCategory}>{cardStyle.categoryLabel}</Text>
                  <Text style={styles.documentTitle}>{doc.docTitle}</Text>

                  <View style={styles.documentMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#64748b"
                      />
                      <Text style={styles.metaText}>{formatDate(doc.docDate)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
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

      {/* Document Viewer Modal */}
      {/* {selectedDocument && (
        <DocumentViewer
          visible={viewerVisible}
          documentUrl={selectedDocument.fileUrl}
          documentTitle={selectedDocument.docTitle}
          onClose={() => {
            setViewerVisible(false);
            setSelectedDocument(null);
          }}
        />
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  navbar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 20,
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  navItemActive: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  navText: {
    fontSize: 14,
    color: '#6b7280',
  },
  navTextActive: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  uploadSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadContent: {
    flex: 1,
    marginRight: 20,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  uploadBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  uploadIllustration: {
    width: 100,
    height: 100,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  refreshBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  documentsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 22,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
  },
  bottomPadding: {
    height: 40,
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
});