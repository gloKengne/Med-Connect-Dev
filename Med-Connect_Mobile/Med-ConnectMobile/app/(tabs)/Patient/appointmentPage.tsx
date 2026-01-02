// // AppointmentsPage.js
// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   TouchableOpacity, 
//   StyleSheet, 
//   SafeAreaView, 
//   StatusBar,
//   Modal,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Alert
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import * as DocumentPicker from 'expo-document-picker';

// export default function AppointmentsPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('upcoming');
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertType, setAlertType] = useState('success');
  
//   // Messaging Modal States
//   const [messagingModalVisible, setMessagingModalVisible] = useState(false);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [messageText, setMessageText] = useState('');
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm looking forward to our appointment on Sat, Nov 15, 2025.",
//       sender: 'patient',
//       timestamp: 'Yesterday, 3:45 PM'
//     },
//     {
//       id: 2,
//       text: "Thank you! I'll be there on time.",
//       sender: 'doctor',
//       timestamp: 'Yesterday, 4:02 PM'
//     }
//   ]);
//   const [attachedFiles, setAttachedFiles] = useState([]);

//   const upcomingAppointments = [
//     {
//       id: 1,
//       doctorName: 'Dr. Emily Chen',
//       specialty: 'Cardiologist',
//       date: 'Sat, Nov 15, 2025',
//       time: '10:00 AM',
//       location: 'City Hospital',
//       confirmed: true,
//       videoCall: false
//     },
//     {
//       id: 2,
//       doctorName: 'Dr. Sarah Johnson',
//       specialty: 'Pediatrician',
//       date: 'Tue, Nov 18, 2025',
//       time: '2:30 PM',
//       location: 'Video Call',
//       confirmed: true,
//       videoCall: true
//     }
//   ];

//   const pastAppointments = [
//     {
//       id: 3,
//       doctorName: 'Dr. Michael Rodriguez',
//       specialty: 'General Practitioner',
//       date: 'Mon, Nov 10, 2025',
//       time: '9:00 AM',
//       location: 'Wellness Clinic',
//       confirmed: true,
//       videoCall: false
//     }
//   ];

//   const showAlert = (message: React.SetStateAction<string>, type = 'success') => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setAlertVisible(true);
//     setTimeout(() => {
//       setAlertVisible(false);
//     }, 3000);
//   };

//   const handleMessage = (appointment: React.SetStateAction<null>) => {
//     setSelectedDoctor(appointment);
//     setMessagingModalVisible(true);
//   };

//   const handleSendMessage = () => {
//     if (messageText.trim() || attachedFiles.length > 0) {
//       const newMessage = {
//         id: messages.length + 1,
//         text: messageText.trim(),
//         sender: 'patient',
//         timestamp: 'Just now',
//         attachments: attachedFiles.length > 0 ? [...attachedFiles] : null
//       };
//       setMessages([...messages, newMessage]);
//       setMessageText('');
//       setAttachedFiles([]);
//       Keyboard.dismiss();
//     }
//   };

//   const handlePickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true,
//         multiple: false
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const file = result.assets[0];
//         setAttachedFiles([...attachedFiles, {
//           name: file.name,
//           size: file.size || 0,
//           uri: file.uri,
//           type: file.mimeType || 'application/octet-stream'
//         }]);
//         showAlert('File attached successfully', 'success');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick document');
//     }
//   };

//   const handleRemoveFile = (index: number) => {
//     const newFiles = attachedFiles.filter((_, i) => i !== index);
//     setAttachedFiles(newFiles);
//   };

//   const handleCancel = (doctorName: string) => {
//     showAlert(`Appointment with ${doctorName} cancelled`, 'error');
//   };

//   const handleJoinVideoCall = (doctorName: string) => {
//     showAlert(`Joining video call with ${doctorName}...`, 'success');
//   };

//   const formatFileSize = (bytes: string | number) => {
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
//     return (bytes / 1048576).toFixed(1) + ' MB';
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />
      
//       {/* Custom Alert */}
//       {alertVisible && (
//         <View style={[
//           styles.alertContainer, 
//           alertType === 'success' ? styles.alertSuccess : 
//           alertType === 'error' ? styles.alertError : styles.alertInfo
//         ]}>
//           <View style={styles.alertContent}>
//             <Ionicons 
//               name={
//                 alertType === 'success' ? 'checkmark-circle' : 
//                 alertType === 'error' ? 'close-circle' : 
//                 'information-circle'
//               } 
//               size={24} 
//               color={
//                 alertType === 'success' ? '#059669' : 
//                 alertType === 'error' ? '#EF4444' : 
//                 '#2563EB'
//               } 
//             />
//             <Text style={styles.alertText}>{alertMessage}</Text>
//           </View>
//         </View>
//       )}
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.logoContainer}>
//           <View style={styles.logo}>
//             <Text style={styles.logoIcon}>+</Text>
//           </View>
//           <Text style={styles.logoText}>Med-Connect</Text>
//         </View>
//         <View style={styles.notificationContainer}>
//           <Ionicons name="notifications-outline" size={24} color="#1F2937" />
//           <View style={styles.badge} />
//         </View>
//       </View>

//       {/* Scrollable Navigation */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={styles.navContainer}
//         contentContainerStyle={styles.navContent}
//       >
//         <TouchableOpacity 
//           style={styles.navTab}
//           onPress={() => router.push('/(tabs)/Patient/patient_dashboard')}
//         >
//           <Text style={styles.navTabText}>Dashboard</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={styles.navTab}
//           onPress={() => router.push('/(tabs)/Patient/records')}
//         >
//           <Text style={styles.navTabText}>My Records</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={styles.navTab}
//           onPress={() => router.push('/(tabs)/Patient/findDoctorsPage')}
//         >
//           <Text style={styles.navTabText}>Find Doctors</Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={styles.navTabActive}
//         //   onPress={() => router.push('/(tabs)/Patient/appointments')}
//         >
//           <Text style={styles.navTabTextActive}>Appointments</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Main Content */}
//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Title Section */}
//         <View style={styles.titleSection}>
//           <Text style={styles.title}>My Appointments</Text>
//           <Text style={styles.subtitle}>Manage your healthcare appointments</Text>
//         </View>

//         {/* Tab Buttons */}
//         <View style={styles.tabButtons}>
//           <TouchableOpacity 
//             style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
//             onPress={() => setActiveTab('upcoming')}
//           >
//             <Ionicons name="calendar-outline" size={18} color={activeTab === 'upcoming' ? '#fff' : '#2563EB'} />
//             <Text style={[styles.tabButtonText, activeTab === 'upcoming' && styles.tabButtonTextActive]}>
//               Upcoming
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
//             onPress={() => setActiveTab('past')}
//           >
//             <Ionicons name="time-outline" size={18} color={activeTab === 'past' ? '#fff' : '#6B7280'} />
//             <Text style={[styles.tabButtonText, activeTab === 'past' && styles.tabButtonTextActive]}>
//               Past
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Appointments List */}
//         <View style={styles.appointmentsContainer}>
//           {activeTab === 'upcoming' ? (
//             upcomingAppointments.map((appointment) => (
//               <View key={appointment.id} style={styles.appointmentCard}>
//                 <View style={styles.appointmentLeft}>
//                   <View style={styles.avatar}>
//                     <Ionicons name="person" size={28} color="#2563EB" />
//                   </View>

//                   <View style={styles.appointmentInfo}>
//                     <View style={styles.doctorHeader}>
//                       <Text style={styles.doctorName}>{appointment.doctorName}</Text>
//                       {appointment.confirmed && (
//                         <View style={styles.confirmedBadge}>
//                           <Ionicons name="checkmark-circle" size={12} color="#059669" />
//                           <Text style={styles.confirmedText}>Confirmed</Text>
//                         </View>
//                       )}
//                     </View>
//                     <Text style={styles.specialty}>{appointment.specialty}</Text>

//                     <View style={styles.detailsContainer}>
//                       <View style={styles.detailRow}>
//                         <Ionicons name="calendar-outline" size={14} color="#6B7280" />
//                         <Text style={styles.detailText}>{appointment.date}</Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Ionicons name="time-outline" size={14} color="#6B7280" />
//                         <Text style={styles.detailText}>{appointment.time}</Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Ionicons 
//                           name={appointment.videoCall ? "videocam-outline" : "location-outline"} 
//                           size={14} 
//                           color="#6B7280" 
//                         />
//                         <Text style={styles.detailText}>{appointment.location}</Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.actionButtons}>
//                   {appointment.videoCall && (
//                     <TouchableOpacity 
//                       style={styles.videoButton}
//                       onPress={() => handleJoinVideoCall(appointment.doctorName)}
//                     >
//                       <Ionicons name="videocam" size={16} color="#fff" />
//                       <Text style={styles.videoButtonText}>Join Video Call</Text>
//                     </TouchableOpacity>
//                   )}
//                   <TouchableOpacity 
//                     style={styles.messageButton}
//                     onPress={() => handleMessage(appointment)}
//                   >
//                     <Ionicons name="chatbubble-outline" size={16} color="#2563EB" />
//                     <Text style={styles.messageButtonText}>Message</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={styles.cancelButton}
//                     onPress={() => handleCancel(appointment.doctorName)}
//                   >
//                     <Ionicons name="close" size={16} color="#EF4444" />
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))
//           ) : (
//             pastAppointments.map((appointment) => (
//               <View key={appointment.id} style={styles.appointmentCard}>
//                 <View style={styles.appointmentLeft}>
//                   <View style={styles.avatar}>
//                     <Ionicons name="person" size={28} color="#2563EB" />
//                   </View>

//                   <View style={styles.appointmentInfo}>
//                     <Text style={styles.doctorName}>{appointment.doctorName}</Text>
//                     <Text style={styles.specialty}>{appointment.specialty}</Text>

//                     <View style={styles.detailsContainer}>
//                       <View style={styles.detailRow}>
//                         <Ionicons name="calendar-outline" size={14} color="#6B7280" />
//                         <Text style={styles.detailText}>{appointment.date}</Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Ionicons name="time-outline" size={14} color="#6B7280" />
//                         <Text style={styles.detailText}>{appointment.time}</Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Ionicons name="location-outline" size={14} color="#6B7280" />
//                         <Text style={styles.detailText}>{appointment.location}</Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.actionButtons}>
//                   <TouchableOpacity 
//                     style={styles.messageButton}
//                     onPress={() => handleMessage(appointment)}
//                   >
//                     <Ionicons name="chatbubble-outline" size={16} color="#2563EB" />
//                     <Text style={styles.messageButtonText}>Message</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))
//           )}
//         </View>
//       </ScrollView>

//       {/* Messaging Modal */}
//       <Modal
//         visible={messagingModalVisible}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setMessagingModalVisible(false)}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <KeyboardAvoidingView 
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.modalContent}
//             keyboardVerticalOffset={0}
//           >
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <View style={styles.modalHeaderLeft}>
//                 <View style={styles.modalAvatar}>
//                   <Ionicons name="person" size={24} color="#2563EB" />
//                 </View>
//                 <View>
//                   <Text style={styles.modalDoctorName}>
//                     {selectedDoctor?.doctorName || 'Doctor'}
//                   </Text>
//                   <Text style={styles.modalSpecialty}>
//                     {selectedDoctor?.specialty || 'Specialist'}
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity 
//                 onPress={() => setMessagingModalVisible(false)}
//                 style={styles.closeButton}
//               >
//                 <Ionicons name="close" size={28} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             {/* Messages List */}
//             <ScrollView 
//               style={styles.messagesContainer}
//               contentContainerStyle={styles.messagesContent}
//               showsVerticalScrollIndicator={false}
//             >
//               {messages.map((message) => (
//                 <View key={message.id}>
//                   <View style={[
//                     styles.messageBubble,
//                     message.sender === 'patient' ? styles.patientMessage : styles.doctorMessage
//                   ]}>
//                     <Text style={[
//                       styles.messageText,
//                       message.sender === 'patient' ? styles.patientMessageText : styles.doctorMessageText
//                     ]}>
//                       {message.text}
//                     </Text>
//                     {message.attachments && message.attachments.map((file: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
//                       <View key={index} style={styles.attachmentPreview}>
//                         <Ionicons name="document-attach" size={16} color="#2563EB" />
//                         <Text style={styles.attachmentName}>{file.name}</Text>
//                       </View>
//                     ))}
//                   </View>
//                   <Text style={[
//                     styles.messageTimestamp,
//                     message.sender === 'patient' ? styles.patientTimestamp : styles.doctorTimestamp
//                   ]}>
//                     {message.timestamp}
//                   </Text>
//                 </View>
//               ))}
//             </ScrollView>

//             {/* Attached Files Preview */}
//             {attachedFiles.length > 0 && (
//               <View style={styles.attachedFilesContainer}>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {attachedFiles.map((file, index) => (
//                     <View key={index} style={styles.attachedFileChip}>
//                       <Ionicons name="document" size={16} color="#2563EB" />
//                       <View style={styles.attachedFileInfo}>
//                         <Text style={styles.attachedFileName} numberOfLines={1}>
//                           {file.name}
//                         </Text>
//                         <Text style={styles.attachedFileSize}>
//                           {formatFileSize(file.size)}
//                         </Text>
//                       </View>
//                       <TouchableOpacity onPress={() => handleRemoveFile(index)}>
//                         <Ionicons name="close-circle" size={20} color="#EF4444" />
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </ScrollView>
//               </View>
//             )}

//             {/* Message Input */}
//             <View style={styles.inputContainer}>
//               <View style={styles.encryptionNotice}>
//                 <Ionicons name="lock-closed" size={12} color="#F59E0B" />
//                 <Text style={styles.encryptionText}>End-to-end encrypted messaging</Text>
//               </View>
//               <View style={styles.inputWrapper}>
//                 <TouchableOpacity 
//                   style={styles.attachButton}
//                   onPress={handlePickDocument}
//                 >
//                   <Ionicons name="attach" size={24} color="#6B7280" />
//                 </TouchableOpacity>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Type your message..."
//                   placeholderTextColor="#9CA3AF"
//                   value={messageText}
//                   onChangeText={setMessageText}
//                   multiline
//                   maxLength={500}
//                 />
//                 <TouchableOpacity 
//                   style={[
//                     styles.sendButton,
//                     (!messageText.trim() && attachedFiles.length === 0) && styles.sendButtonDisabled
//                   ]}
//                   onPress={handleSendMessage}
//                   disabled={!messageText.trim() && attachedFiles.length === 0}
//                 >
//                   <Ionicons 
//                     name="send" 
//                     size={20} 
//                     color={(!messageText.trim() && attachedFiles.length === 0) ? '#9CA3AF' : '#fff'} 
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </KeyboardAvoidingView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: '#2563EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoIcon: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   logoText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginLeft: 12,
//   },
//   notificationContainer: {
//     position: 'relative',
//   },
//   badge: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#EF4444',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   navContainer: {
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     maxHeight: 50,
//   },
//   navContent: {
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   navTab: {
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   navTabActive: {
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 2,
//     borderBottomColor: '#2563EB',
//   },
//   navTabText: {
//     fontSize: 16,
//     fontWeight: '400',
//     color: '#9CA3AF',
//   },
//   navTabTextActive: {
//     color: '#2563EB',
//     fontWeight: '500',
//   },
//   content: {
//     flex: 1,
//   },
//   titleSection: {
//     padding: 20,
//     paddingTop: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: '#6B7280',
//     lineHeight: 22,
//   },
//   tabButtons: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     gap: 12,
//   },
//   tabButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     paddingVertical: 14,
//     gap: 8,
//   },
//   tabButtonActive: {
//     backgroundColor: '#2563EB',
//     borderColor: '#2563EB',
//   },
//   tabButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   tabButtonTextActive: {
//     color: '#fff',
//   },
//   appointmentsContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   appointmentCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   appointmentLeft: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#DBEAFE',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   appointmentInfo: {
//     flex: 1,
//     marginLeft: 16,
//   },
//   doctorHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//     flexWrap: 'wrap',
//   },
//   doctorName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginRight: 8,
//   },
//   confirmedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#D1FAE5',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//     gap: 4,
//   },
//   confirmedText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#059669',
//   },
//   specialty: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 12,
//   },
//   detailsContainer: {
//     gap: 6,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   detailText: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   actionButtons: {
//     gap: 10,
//   },
//   videoButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#2563EB',
//     borderRadius: 12,
//     paddingVertical: 12,
//     gap: 8,
//   },
//   videoButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   messageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1.5,
//     borderColor: '#2563EB',
//     borderRadius: 12,
//     paddingVertical: 12,
//     gap: 8,
//   },
//   messageButtonText: {
//     color: '#2563EB',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   cancelButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1.5,
//     borderColor: '#EF4444',
//     borderRadius: 12,
//     paddingVertical: 12,
//     gap: 8,
//   },
//   cancelButtonText: {
//     color: '#EF4444',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   alertContainer: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     right: 20,
//     borderRadius: 12,
//     padding: 16,
//     zIndex: 1000,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   alertSuccess: {
//     backgroundColor: '#D1FAE5',
//   },
//   alertInfo: {
//     backgroundColor: '#DBEAFE',
//   },
//   alertError: {
//     backgroundColor: '#FEE2E2',
//   },
//   alertContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   alertText: {
//     flex: 1,
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   // Modal Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   modalContent: {
//     flex: 1,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     backgroundColor: '#fff',
//   },
//   modalHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   modalAvatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#DBEAFE',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalDoctorName: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   modalSpecialty: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   messagesContainer: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   messagesContent: {
//     padding: 20,
//     paddingBottom: 10,
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 6,
//   },
//   patientMessage: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#2563EB',
//     borderBottomRightRadius: 4,
//   },
//   doctorMessage: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 22,
//   },
//   patientMessageText: {
//     color: '#fff',
//   },
//   doctorMessageText: {
//     color: '#1F2937',
//   },
//   messageTimestamp: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginBottom: 16,
//   },
//   patientTimestamp: {
//     alignSelf: 'flex-end',
//     marginRight: 4,
//   },
//   doctorTimestamp: {
//     alignSelf: 'flex-start',
//     marginLeft: 4,
//   },
//   attachmentPreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   attachmentName: {
//     fontSize: 13,
//     color: '#fff',
//   },
//   attachedFilesContainer: {
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//   },
//   attachedFileChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     marginRight: 8,
//     gap: 8,
//     maxWidth: 200,
//   },
//   attachedFileInfo: {
//     flex: 1,
//   },
//   attachedFileName: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   attachedFileSize: {
//     fontSize: 11,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   inputContainer: {
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     paddingBottom: Platform.OS === 'ios' ? 20 : 12,
//   },
//   encryptionNotice: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginBottom: 12,
//   },
//   encryptionText: {
//     fontSize: 12,
//     color: '#F59E0B',
//     fontWeight: '500',
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 24,
//     paddingHorizontal: 4,
//     paddingVertical: 4,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   attachButton: {
//     padding: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     fontSize: 15,
//     color: '#1F2937',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     maxHeight: 100,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#2563EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#E5E7EB',
//   },
// });