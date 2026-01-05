// DoctorNotificationsPage.tsx
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
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api'; // Replace with your actual backend URL

interface Notification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  relatedConnection: {
    _id: string;
    status: string;
    patient: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export default function DoctorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        showAlert('Please login first', 'error');
        return;
      }

      console.log('📬 Fetching notifications...');

      const response = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📦 Notifications data:', data);

      if (data.success) {
        setNotifications(data.notifications);
        console.log('✅ Loaded notifications:', data.notifications.length);
      } else {
        showAlert(data.message || 'Failed to fetch notifications', 'error');
      }
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
      showAlert('Error loading notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleConnectionResponse = async (connectionId: string, action: 'accept' | 'reject', notificationId: string) => {
    try {
      setProcessingId(connectionId);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        showAlert('Please login first', 'error');
        return;
      }

      console.log(`📝 ${action}ing connection:`, connectionId);

      const response = await fetch(`${API_URL}/connections/${connectionId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        showAlert(
          action === 'accept' 
            ? 'Connection accepted successfully!' 
            : 'Connection request declined',
          'success'
        );
        
        // Mark notification as read
        await markAsRead(notificationId);
        
        // Refresh notifications
        fetchNotifications();
      } else {
        showAlert(data.message || `Failed to ${action} connection`, 'error');
      }
    } catch (error) {
      console.error(`💥 Error ${action}ing connection:`, error);
      showAlert(`Error ${action}ing connection`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      showAlert('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showAlert('Error marking notifications as read', 'error');
    }
  };

  const showAlert = (message: string, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
        return { name: 'person-add', color: '#2563EB', bg: '#DBEAFE' };
      case 'CONNECTION_ACCEPTED':
        return { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' };
      case 'CONNECTION_REJECTED':
        return { name: 'close-circle', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { name: 'notifications', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const pendingNotifications = notifications.filter(
    n => n.type === 'CONNECTION_REQUEST' && n.relatedConnection?.status === 'pending'
  );
  const otherNotifications = notifications.filter(
    n => n.type !== 'CONNECTION_REQUEST' || n.relatedConnection?.status !== 'pending'
  );
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Alert */}
      {alertVisible && (
        <View style={[
          styles.alertContainer, 
          alertType === 'success' ? styles.alertSuccess : styles.alertError
        ]}>
          <View style={styles.alertContent}>
            <Ionicons 
              name={alertType === 'success' ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={alertType === 'success' ? '#059669' : '#EF4444'} 
            />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/Doctor/doctor_dashboard')}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            You'll see connection requests and updates here
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Pending Connection Requests */}
          {pendingNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Connection Requests ({pendingNotifications.length})
              </Text>
              {pendingNotifications.map((notification) => {
                const iconData = getNotificationIcon(notification.type);
                const isProcessing = processingId === notification.relatedConnection?._id;
                
                return (
                  <View 
                    key={notification._id} 
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadCard
                    ]}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={[styles.notificationIcon, { backgroundColor: iconData.bg }]}>
                        <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          New Connection Request
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.sender?.firstName} {notification.sender?.lastName} wants to connect with you
                        </Text>
                        <Text style={styles.notificationTime}>
                          {getTimeAgo(notification.createdAt)}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.acceptButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleConnectionResponse(
                          notification.relatedConnection._id,
                          'accept',
                          notification._id
                        )}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.rejectButton, isProcessing && styles.disabledButton]}
                        onPress={() => handleConnectionResponse(
                          notification.relatedConnection._id,
                          'reject',
                          notification._id
                        )}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <>
                            <Ionicons name="close" size={18} color="#EF4444" />
                            <Text style={styles.rejectButtonText}>Decline</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Other Notifications */}
          {otherNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {otherNotifications.map((notification) => {
                const iconData = getNotificationIcon(notification.type);
                
                return (
                  <TouchableOpacity
                    key={notification._id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadCard
                    ]}
                    onPress={() => markAsRead(notification._id)}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={[styles.notificationIcon, { backgroundColor: iconData.bg }]}>
                        <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {getTimeAgo(notification.createdAt)}
                        </Text>
                      </View>
                      {!notification.isRead && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  alertSuccess: {
    backgroundColor: '#D1FAE5',
  },
  alertError: {
    backgroundColor: '#FEE2E2',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});