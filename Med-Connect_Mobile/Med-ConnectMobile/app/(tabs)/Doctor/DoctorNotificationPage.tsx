// DoctorNotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.165:5000/api'; 

interface Notification {
  _id: string;
  type: 'CONNECTION_REQUEST' | 'APPOINTMENT_REQUEST' | 'CONNECTION_ACCEPTED' | 'CONNECTION_REJECTED' | string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  relatedConnection?: {
    _id: string;
    status: string;
  };
  relatedAppointment?: {
    _id: string;
    status: string;
    date: string;
    startTime: string;
  };
}

export default function DoctorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- HANDLER FOR APPOINTMENTS ---
  const handleAppointmentResponse = async (appointmentId: string, action: 'confirmed' | 'rejected', notificationId: string) => {
    try {
      setProcessingId(appointmentId);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", `Appointment ${action}`);
        await markAsRead(notificationId);
        fetchNotifications();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process appointment");
    } finally {
      setProcessingId(null);
    }
  };

  // --- HANDLER FOR CONNECTIONS (RESTORED) ---
  const handleConnectionResponse = async (connectionId: string, action: 'accept' | 'reject', notificationId: string) => {
    try {
      setProcessingId(connectionId);
      const token = await AsyncStorage.getItem('authToken');
      // Using the route from your backend: /api/connections/:id/respond
      const response = await fetch(`${API_URL}/connections/${connectionId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: action })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", `Connection ${action}ed`);
        await markAsRead(notificationId);
        fetchNotifications();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process connection request");
    } finally {
      setProcessingId(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Doctor/doctor_dashboard')}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchNotifications();}} />}
      >
        {notifications.map((notification) => (
          <View 
            key={notification._id} 
            style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
          >
            <View style={styles.row}>
              <View style={[styles.iconContainer, { backgroundColor: notification.type.includes('APPOINTMENT') ? '#FEF3C7' : '#DBEAFE' }]}>
                <Ionicons 
                  name={notification.type.includes('APPOINTMENT') ? "calendar" : "person-add"} 
                  size={22} 
                  color={notification.type.includes('APPOINTMENT') ? "#D97706" : "#2563EB"} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.messageText}>{notification.message}</Text>
                {notification.type === 'APPOINTMENT_REQUEST' && notification.relatedAppointment && (
                  <Text style={styles.subText}>
                    Schedule: {new Date(notification.relatedAppointment.date).toLocaleDateString()} at {notification.relatedAppointment.startTime}
                  </Text>
                )}
                <Text style={styles.timeText}>{getTimeAgo(notification.createdAt)}</Text>
              </View>
            </View>

            {/* ACTION BUTTONS: Now handles BOTH types */}
            {!notification.isRead && (
              <View style={styles.buttonRow}>
                {notification.type === 'APPOINTMENT_REQUEST' && notification.relatedAppointment && (
                  <>
                    <TouchableOpacity 
                      style={styles.confirmBtn}
                      onPress={() => handleAppointmentResponse(notification.relatedAppointment!._id, 'confirmed', notification._id)}
                      disabled={processingId === notification.relatedAppointment._id}
                    >
                      <Text style={styles.btnText}>Confirm Appointment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectBtn}
                      onPress={() => handleAppointmentResponse(notification.relatedAppointment!._id, 'rejected', notification._id)}
                      disabled={processingId === notification.relatedAppointment._id}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}

                {notification.type === 'CONNECTION_REQUEST' && notification.relatedConnection && (
                  <>
                    <TouchableOpacity 
                      style={styles.confirmBtn}
                      onPress={() => handleConnectionResponse(notification.relatedConnection!._id, 'accept', notification._id)}
                      disabled={processingId === notification.relatedConnection._id}
                    >
                      <Text style={styles.btnText}>Accept Connection</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectBtn}
                      onPress={() => handleConnectionResponse(notification.relatedConnection!._id, 'reject', notification._id)}
                      disabled={processingId === notification.relatedConnection._id}
                    >
                      <Text style={styles.rejectText}>Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { padding: 10, borderRadius: 10, marginRight: 12 },
  textContainer: { flex: 1 },
  messageText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  subText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  timeText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  buttonRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  confirmBtn: { flex: 1, backgroundColor: '#2563EB', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  btnText: { color: '#fff', fontWeight: '700' },
  rejectText: { color: '#EF4444', fontWeight: '700' },
});