// MessagesPage.tsx - Shows all connected doctors for messaging
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
import PatientHeader from './patient-header';

const API_URL = 'http://192.168.1.165:5000/api';

// ==================== INTERFACES ====================
interface ConnectedDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  phone?: string;
}

interface Connection {
  _id: string;
  doctor: ConnectedDoctor;
  patient: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationItem {
  connectionId: string;  // ✅ ADD THIS
  doctorId: string;
  doctorName: string;
  specialization: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// ==================== MAIN COMPONENT ====================
export default function MessagesPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConnectedDoctors();
    // Refresh every 30 seconds to check for new connections
    const interval = setInterval(fetchConnectedDoctors, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== API CALLS ==========
  const fetchConnectedDoctors = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Fetch patient's connections
      const response = await fetch(`${API_URL}/connections/patient`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      console.log('📋 Connected Doctors:', data);

      if (data.success && Array.isArray(data.connections)) {
        setConnections(data.connections);
        
        // Transform connections into conversation items
        const conversationItems: ConversationItem[] = data.connections.map((conn: Connection) => ({
            connectionId: conn._id,  // ✅ ADDED - This is the connection ID!
            doctorId: conn.doctor._id,
            doctorName: `Dr. ${conn.doctor.firstName} ${conn.doctor.lastName}`,
            specialization: conn.doctor.specialization || 'General Practice',
            lastMessage: 'Start a conversation',
            lastMessageTime: conn.createdAt,
            unreadCount: 0,
            isOnline: false
        }));
        
        setConversations(conversationItems);
        
        // Fetch last messages for each doctor
        await fetchLastMessages(conversationItems.map(c => c.doctorId));
      } else {
        setConnections([]);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching connected doctors:', error);
      setConnections([]);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLastMessages = async (doctorIds: string[]) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      // Fetch messages for each doctor to get last message
      for (const doctorId of doctorIds) {
        try {
          const response = await fetch(`${API_URL}/messages/conversation/${doctorId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          if (data.success && data.messages && data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            
            // Update conversation with last message
            setConversations(prev => prev.map(conv => 
              conv.doctorId === doctorId 
                ? {
                    ...conv,
                    lastMessage: lastMessage.messageType === 'document' 
                      ? '📎 Document' 
                      : lastMessage.content,
                    lastMessageTime: lastMessage.timestamp,
                    unreadCount: data.messages.filter((m: any) => 
                      !m.read && m.senderId !== lastMessage.receiverId
                    ).length
                  }
                : conv
            ));
          }
        } catch (error) {
          console.error(`Error fetching messages for doctor ${doctorId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching last messages:', error);
    }
  };

  const onRefresh = () => {
    fetchConnectedDoctors(true);
  };

  // ========== HELPER FUNCTIONS ==========
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

  const openConversation = (connectionId: string, doctorName: string) => {
  console.log('🔗 Opening conversation with connectionId:', connectionId);
  router.push({
    pathname: '/(tabs)/Patient/conversations',
    params: { 
      connectionId: connectionId,  // ✅ FIXED
      userName: doctorName 
    }
  } as any);
};

  const filteredConversations = conversations.filter(conv =>
    conv.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <PatientHeader activeTab="Messages" unreadCount={5} />
      

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {connections.length > 0 
              ? `${connections.length} connected doctor${connections.length !== 1 ? 's' : ''}`
              : 'No connected doctors yet'
            }
          </Text>
        </View>

        {/* SEARCH BAR */}
        {conversations.length > 0 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors..."
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
            <Text style={styles.loadingText}>Loading connected doctors...</Text>
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
                ? 'No doctors found' 
                : 'No connected doctors yet'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Connect with doctors to start messaging'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.findDoctorsBtn}
                onPress={() => router.push('/(tabs)/Patient/findDoctorsPage')}
              >
                <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.findDoctorsBtnText}>Find Doctors</Text>
              </TouchableOpacity>
            )}
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
                key={conversation.doctorId}
                style={styles.conversationCard}
                onPress={() => openConversation(
                    conversation.connectionId,  // ✅ FIXED - use connectionId
                    conversation.doctorName
                )}
                activeOpacity={0.7}
                >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="medical" size={28} color="#2563EB" />
                  </View>
                  {conversation.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.conversationName} numberOfLines={1}>
                        {conversation.doctorName}
                      </Text>
                      <Text style={styles.specialization} numberOfLines={1}>
                        {conversation.specialization}
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

  // HEADER
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

  // NAVIGATION
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

  // CONTENT
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

  // SEARCH
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

  // LOADING
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

  // EMPTY STATE
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
  findDoctorsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findDoctorsBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // CONVERSATIONS LIST
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
  specialization: {
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