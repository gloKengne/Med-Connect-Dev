// BookingModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  doctorName: string;
  onConfirm: (date: string, time: string) => void;
}

export default function BookingModal({ isVisible, onClose, doctorName, onConfirm }: BookingModalProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Mock data for days (You can later generate these dynamically)
  const days = [
    { id: '1', date: 'Mon, Jan 12', value: '2026-01-12' },
    { id: '2', date: 'Tue, Jan 13', value: '2026-01-13' },
    { id: '3', date: 'Wed, Jan 14', value: '2026-01-14' },
    { id: '4', date: 'Thu, Jan 15', value: '2026-01-15' },
  ];

  // Mock data for time slots
  const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const handleBooking = () => {
    if (selectedDay && selectedTime) {
      onConfirm(selectedDay, selectedTime);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.doctorLabel}>With Dr. {doctorName}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Day Selection */}
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
              {days.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.dayCard, selectedDay === item.value && styles.selectedCard]}
                  onPress={() => setSelectedDay(item.value)}
                >
                  <Text style={[styles.dayText, selectedDay === item.value && styles.selectedText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time Selection */}
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeCard, selectedTime === slot && styles.selectedCard]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeText, selectedTime === slot && styles.selectedText]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.confirmButton, (!selectedDay || !selectedTime) && styles.disabledButton]}
            onPress={handleBooking}
            disabled={!selectedDay || !selectedTime}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  doctorLabel: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginVertical: 12 },
  daysContainer: { flexDirection: 'row', marginBottom: 10 },
  dayCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timeCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    minWidth: '28%',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  dayText: { fontSize: 14, color: '#4B5563' },
  timeText: { fontSize: 14, color: '#4B5563' },
  selectedText: { color: '#2563EB', fontWeight: '600' },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { backgroundColor: '#9CA3AF' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});