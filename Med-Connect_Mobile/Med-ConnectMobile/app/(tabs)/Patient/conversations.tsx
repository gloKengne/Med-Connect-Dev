// ConversationPage.tsx - Real-Time Messaging
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://192.168.1.165:5000/api';
const SOCKET_URL = 'http://192.168.1.165:5000';

// ==================== INTERFACES ====================
interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  content: string;
  connection: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== MAIN COMPONENT ====================
export default function ConversationPage() {
  const params = useLocalSearchParams();
  const connectionId = params.connectionId as string;
  const otherUserName = params.userName as string;

  // ========== STATE ==========
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  // ========== SOCKET SETUP ==========
  useEffect(() => {
    setupSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      // Get current user
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userResponse.ok) throw new Error('Failed to get user info');
      
      const userData = await userResponse.json();
      const userId = userData._id || userData.userId || userData.id;
      setCurrentUserId(userId);

      // Connect to Socket.IO
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current?.id);
        setIsConnected(true);
        // Join with user ID
        socketRef.current?.emit('join', userId);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for new messages
      socketRef.current.on('new_message', (data: { message: Message; connectionId: string }) => {
        console.log('📨 New message received:', data);
        if (data.connectionId === connectionId) {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        }
      });

    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  };

  // ========== INITIALIZATION ==========
  useEffect(() => {
    console.log('📋 Navigation params:', { connectionId, otherUserName });
    
    if (!connectionId || !otherUserName) {
      console.error('❌ Missing params - connectionId:', connectionId, 'userName:', otherUserName);
      Alert.alert('Error', 'Invalid conversation parameters. Missing connectionId or userName.');
      router.back();
      return;
    }
    fetchMessages();
  }, [connectionId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // ========== API CALLS ==========
  const fetchMessages = async () => {
    try {
      console.log('🔍 Starting fetchMessages for connectionId:', connectionId);
      
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No token found, redirecting to signin');
        router.push('/signin');
        return;
      }

      const url = `${API_URL}/messages/${connectionId}`;
      console.log('📡 Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }

      if (data.success && Array.isArray(data.messages)) {
        console.log('✅ Messages loaded successfully:', data.messages.length);
        setMessages(data.messages);
      } else {
        console.warn('⚠️ Unexpected data structure:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      console.error('❌ Error details:');
      Alert.alert(
        'Error Loading Messages', 
        `Could not load messages: \n\nConnectionId: ${connectionId}`
      );
      setMessages([]);
    } finally {
      console.log('🏁 fetchMessages completed, setting loading to false');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const tempMessage = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        setMessageText(tempMessage); // Restore message on error
        return;
      }

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectionId: connectionId,
          content: tempMessage
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Add message to local state (will also come via socket for receiver)
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(tempMessage); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };

  const isMyMessage = (senderId: string | User) => {
    const id = typeof senderId === 'string' ? senderId : senderId._id;
    return id === currentUserId;
  };

  const getSenderId = (sender: string | User): string => {
    return typeof sender === 'string' ? sender : sender._id;
  };

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/(tabs)/Patient/messages')}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medical" size={20} color="#2563EB" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUserName}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot, 
                isConnected ? styles.statusOnline : styles.statusOffline
              ]} />
              <Text style={styles.headerStatus}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.moreBtn}
          onPress={() => Alert.alert('More Options', 'Feature coming soon')}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* MESSAGES */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyMessages}>
                <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Start the conversation with {otherUserName}
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message._id}
                  style={[
                    styles.messageWrapper,
                    isMyMessage(message.sender) 
                      ? styles.myMessageWrapper 
                      : styles.theirMessageWrapper
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMyMessage(message.sender) 
                        ? styles.myMessage 
                        : styles.theirMessage
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMyMessage(message.sender) && styles.myMessageText
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.messageTime,
                      isMyMessage(message.sender) && styles.myMessageTime
                    ]}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <View style={styles.encryptionNotice}>
            <Ionicons name="lock-closed" size={12} color="#10B981" />
            <Text style={styles.encryptionText}>
              {isConnected ? 'Real-time messaging active' : 'Reconnecting...'}
            </Text>
          </View>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              editable={!sending}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!messageText.trim() || sending) && styles.sendBtnDisabled
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusOffline: {
    backgroundColor: '#F59E0B',
  },
  headerStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  myMessage: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  myMessageTime: {
    textAlign: 'right',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  encryptionText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
});