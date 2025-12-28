// import React, { useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Platform,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { WebView } from 'react-native-webview';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

// // Type assertion for FileSystem
// const FS = FileSystem as any;

// const { width, height } = Dimensions.get('window');

// interface DocumentViewerProps {
//   visible: boolean;
//   documentUrl: string;
//   documentTitle: string;
//   onClose: () => void;
// }

// export default function DocumentViewer({
//   visible,
//   documentUrl,
//   documentTitle,
//   onClose,
// }: DocumentViewerProps) {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const handleError = () => {
//     setError(true);
//     setLoading(false);
//   };

//   const handleLoad = () => {
//     setLoading(false);
//     setError(false);
//   };

//   const handleDownload = async () => {
//     try {
//       Alert.alert('Downloading', 'Please wait...');

//       const fileExtension = documentUrl.split('.').pop();
//       const fileUri = `${FS.documentDirectory}${documentTitle}.${fileExtension}`;

//       const downloadResult = await FS.downloadAsync(documentUrl, fileUri);

//       if (downloadResult.status === 200) {
//         const isAvailable = await Sharing.isAvailableAsync();
        
//         if (isAvailable) {
//           await Sharing.shareAsync(downloadResult.uri, {
//             dialogTitle: `Share ${documentTitle}`,
//           });
//         } else {
//           Alert.alert('Success', 'File downloaded successfully!');
//         }
//       } else {
//         Alert.alert('Error', 'Failed to download file');
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       Alert.alert('Error', 'Failed to download file');
//     }
//   };

//   // Determine the correct source URL based on platform and file type
//   const getSourceUri = () => {
//     if (Platform.OS === 'android' && documentUrl.toLowerCase().endsWith('.pdf')) {
//       return `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`;
//     }
//     return documentUrl;
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       onRequestClose={onClose}
//       statusBarTranslucent
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Ionicons name="close" size={28} color="#fff" />
//           </TouchableOpacity>
          
//           <View style={styles.titleContainer}>
//             <Text style={styles.title} numberOfLines={1}>
//               {documentTitle}
//             </Text>
//           </View>

//           <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
//             <Ionicons name="download-outline" size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         {/* Document Content */}
//         <View style={styles.content}>
//           {loading && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#2563eb" />
//               <Text style={styles.loadingText}>Loading document...</Text>
//             </View>
//           )}

//           {error && (
//             <View style={styles.errorContainer}>
//               <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
//               <Text style={styles.errorText}>Failed to load document</Text>
//               <Text style={styles.errorSubtext}>
//                 The document couldn't be displayed in the viewer.
//               </Text>
//               <TouchableOpacity style={styles.downloadErrorButton} onPress={handleDownload}>
//                 <Ionicons name="download-outline" size={20} color="#fff" />
//                 <Text style={styles.downloadErrorText}>Download Instead</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {!error && (
//             <WebView
//               source={{ uri: getSourceUri() }}
//               style={styles.webview}
//               onError={handleError}
//               onLoad={handleLoad}
//               startInLoadingState={false}
//               scalesPageToFit={true}
//             />
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#2563eb',
//     paddingTop: Platform.OS === 'ios' ? 50 : 40,
//     paddingBottom: 15,
//     paddingHorizontal: 16,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   titleContainer: {
//     flex: 1,
//     marginHorizontal: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   downloadButton: {
//     padding: 4,
//   },
//   content: {
//     flex: 1,
//     backgroundColor: '#f3f4f6',
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     zIndex: 10,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#64748b',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//     backgroundColor: '#fff',
//   },
//   errorText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1f2937',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   errorSubtext: {
//     fontSize: 15,
//     color: '#6b7280',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   downloadErrorButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#2563eb',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   downloadErrorText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });