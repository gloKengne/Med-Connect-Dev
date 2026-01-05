// Doctor MessagesPage.tsx - Shows all connected patients for messaging
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api';

// ==================== INTERFACES ====================
interface ConnectedPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface Connection {
  _id: string;
  patient: ConnectedPatient;
  doctor: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationItem {
  connectionId: string;
  patientId: string;
  patientName: string;
  patientAge: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// ==================== MAIN COMPONENT ====================
export default function DoctorMessagesPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConnectedPatients();
    // Refresh every 30 seconds
    const interval = setInterval(fetchConnectedPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== API CALLS ==========
  const fetchConnectedPatients = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      console.log('📋 Fetching connected patients...');

      const response = await fetch(`${API_URL}/connections/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      console.log('📋 Connected Patients Response:', data);

      if (data.success && Array.isArray(data.connections)) {
        setConnections(data.connections);
        
        // Transform connections into conversation items
        const conversationItems: ConversationItem[] = data.connections.map((conn: Connection) => ({
          connectionId: conn._id,
          patientId: conn.patient._id,
          patientName: `${conn.patient.firstName} ${conn.patient.lastName}`,
          patientAge: calculateAge(conn.patient.dateOfBirth),
          lastMessage: 'No messages yet',
          lastMessageTime: conn.createdAt,
          unreadCount: 0,
          isOnline: false
        }));
        
        console.log('✅ Conversation items created:', conversationItems.length);
        setConversations(conversationItems);
      } else {
        setConnections([]);
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching connected patients:', error);
      setConnections([]);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchConnectedPatients(true);
  };

  // ========== HELPER FUNCTIONS ==========
  const calculateAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return 'Age N/A';
    
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} yrs`;
    } catch (error) {
      return 'Age N/A';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  const openConversation = (connectionId: string, patientName: string) => {
    console.log('🔗 Opening conversation with connectionId:', connectionId);
    router.push({
      pathname: '/(tabs)/Doctor/conversations',
      params: { 
        connectionId: connectionId,
        userName: patientName 
      }
    } as any);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.logoText}>Med-Connect</Text>
        </View>
        <TouchableOpacity style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* NAVIGATION */}
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
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => router.push('/(tabs)/Doctor/doctor-patients')}
        >
          <Text style={styles.navTabText}>My Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTabActive}>
          <Text style={styles.navTabTextActive}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navTab}
        //   onPress={() => router.push('/(tabs)/Doctor/schedule')}
        >
          <Text style={styles.navTabText}>Schedule</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Patient Messages</Text>
          <Text style={styles.subtitle}>
            {connections.length > 0 
              ? `${connections.length} connected patient${connections.length !== 1 ? 's' : ''}`
              : 'No connected patients yet'
            }
          </Text>
        </View>

        {/* SEARCH BAR */}
        {conversations.length > 0 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* CONVERSATIONS LIST */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Ionicons 
              name={searchQuery ? "search-outline" : "people-outline"} 
              size={64} 
              color="#D1D5DB" 
            />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No patients found' 
                : 'No connected patients yet'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Patients will appear here once they connect with you'
              }
            </Text>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.conversationsList}
            contentContainerStyle={styles.conversationsListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.patientId}
                style={styles.conversationCard}
                onPress={() => openConversation(conversation.connectionId, conversation.patientName)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={28} color="#2563EB" />
                  </View>
                  {conversation.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.conversationName} numberOfLines={1}>
                        {conversation.patientName}
                      </Text>
                      <Text style={styles.patientAge} numberOfLines={1}>
                        {conversation.patientAge}
                      </Text>
                    </View>
                    <Text style={styles.conversationTime}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>

                  <View style={styles.conversationFooter}>
                    <Text
                      style={[
                        styles.lastMessage,
                        conversation.unreadCount > 0 && styles.lastMessageUnread
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
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
  notificationContainer: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 8,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  conversationsListContent: {
    paddingBottom: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 13,
    color: '#6B7280',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#374151',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 20,
  },
});