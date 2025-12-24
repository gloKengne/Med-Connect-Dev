import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DoctorRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: any) => Promise<void>;
  doctorData: any;
}

export default function DoctorRegistrationModal({ 
  visible, 
  onClose, 
  onComplete,
  doctorData 
}: DoctorRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Professional Information
  const [specialty, setSpecialty] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  
  const COUNTRY_CODE = '+237'; // Cameroon

  // Step 2: Availability
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
  ];

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Generate time slots (e.g., 06:00 AM to 11:00 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        times.push(`${displayHour}:${displayMinute} ${period}`);
      }
    }
    return times;
  };

  const timeSlots = generateTimeSlots();

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!specialty || !phoneNumber) {
        alert('Please fill in required fields');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleFinish = async () => {
    // Validate step 2
    if (selectedDays.length === 0 || !startTime || !endTime) {
      alert('Please select availability days and hours');
      return;
    }

    setLoading(true);

    const completeData = {
      ...doctorData,
      specialty,
      phoneNumber: `${COUNTRY_CODE}${phoneNumber}`,
      hospitalAffiliation,
      yearsOfExperience,
      consultationFee,
      availability: {
        days: selectedDays,
        startTime,
        endTime
      }
    };

    try {
      // Call the completion handler
      await onComplete(completeData);
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                {currentStep === 2 && (
                  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#374151" />
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={styles.title}>Complete Your Doctor Profile</Text>
                  <Text style={styles.subtitle}>
                    Step {currentStep} of 2 - {currentStep === 1 ? 'Professional Information' : 'Availability Hours'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <ScrollView 
            style={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && (
              <View>
                {/* Specialty Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Specialty <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.selectInput}
                    onPress={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                  >
                    <Text style={[
                      styles.selectText,
                      !specialty && styles.placeholderText
                    ]}>
                      {specialty || 'Select your specialty'}
                    </Text>
                    <Feather name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>

                  {/* Specialty Picker Dropdown */}
                  {showSpecialtyPicker && (
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.pickerScroll}>
                        {specialties.map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.pickerItem}
                            onPress={() => {
                              setSpecialty(item);
                              setShowSpecialtyPicker(false);
                            }}
                          >
                            <Text style={styles.pickerItemText}>{item}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Phone Number Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Phone Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.phoneContainer}>
                    {/* Country Code Display */}
                    <View style={styles.countryCodeDisplay}>
                      <Text style={styles.countryCodeText}>🇨🇲 +237</Text>
                    </View>

                    {/* Phone Number Input */}
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="6 XX XX XX XX"
                      placeholderTextColor="#9ca3af"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Hospital Affiliation Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Hospital Affiliation</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="City General Hospital"
                    placeholderTextColor="#9ca3af"
                    value={hospitalAffiliation}
                    onChangeText={setHospitalAffiliation}
                  />
                </View>

                {/* Years of Experience & Consultation Fee Row */}
                <View style={styles.rowContainer}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Years of Experience</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="10"
                      placeholderTextColor="#9ca3af"
                      value={yearsOfExperience}
                      onChangeText={setYearsOfExperience}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Consultation Fee ($)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="150"
                      placeholderTextColor="#9ca3af"
                      value={consultationFee}
                      onChangeText={setConsultationFee}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Next Button */}
                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextButtonText}>Next: Availability Hours</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStep === 2 && (
              <View>
                {/* Availability Days */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Available Days <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.helperText}>Select the days you're available for consultations</Text>
                  
                  <View style={styles.daysContainer}>
                    {daysOfWeek.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          selectedDays.includes(day) && styles.dayButtonSelected
                        ]}
                        onPress={() => toggleDay(day)}
                      >
                        <Text style={[
                          styles.dayButtonText,
                          selectedDays.includes(day) && styles.dayButtonTextSelected
                        ]}>
                          {day.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Working Hours */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Working Hours <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.helperText}>Set your typical consultation hours</Text>
                  
                  <View style={styles.timeContainer}>
                    {/* Start Time Dropdown */}
                    <View style={styles.timeInputWrapper}>
                      <Text style={styles.timeLabel}>Start Time</Text>
                      <TouchableOpacity 
                        style={styles.selectInput}
                        onPress={() => {
                          setShowStartTimePicker(!showStartTimePicker);
                          setShowEndTimePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.selectText,
                          !startTime && styles.placeholderText
                        ]}>
                          {startTime || 'Select time'}
                        </Text>
                        <Feather name="chevron-down" size={20} color="#6b7280" />
                      </TouchableOpacity>

                      {/* Start Time Picker Dropdown */}
                      {showStartTimePicker && (
                        <View style={styles.pickerContainer}>
                          <ScrollView style={styles.pickerScroll}>
                            {timeSlots.map((time, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.pickerItem}
                                onPress={() => {
                                  setStartTime(time);
                                  setShowStartTimePicker(false);
                                }}
                              >
                                <Text style={styles.pickerItemText}>{time}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    <View style={styles.timeSeparator}>
                      <Feather name="arrow-right" size={20} color="#6b7280" />
                    </View>

                    {/* End Time Dropdown */}
                    <View style={styles.timeInputWrapper}>
                      <Text style={styles.timeLabel}>End Time</Text>
                      <TouchableOpacity 
                        style={styles.selectInput}
                        onPress={() => {
                          setShowEndTimePicker(!showEndTimePicker);
                          setShowStartTimePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.selectText,
                          !endTime && styles.placeholderText
                        ]}>
                          {endTime || 'Select time'}
                        </Text>
                        <Feather name="chevron-down" size={20} color="#6b7280" />
                      </TouchableOpacity>

                      {/* End Time Picker Dropdown */}
                      {showEndTimePicker && (
                        <View style={styles.pickerContainer}>
                          <ScrollView style={styles.pickerScroll}>
                            {timeSlots.map((time, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.pickerItem}
                                onPress={() => {
                                  setEndTime(time);
                                  setShowEndTimePicker(false);
                                }}
                              >
                                <Text style={styles.pickerItemText}>{time}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Additional Note */}
                <View style={styles.noteContainer}>
                  <Feather name="info" size={16} color="#2563eb" />
                  <Text style={styles.noteText}>
                    You can update your availability schedule anytime from your profile settings.
                  </Text>
                </View>

                {/* Finish Button */}
                <TouchableOpacity 
                  style={styles.finishButton}
                  onPress={handleFinish}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.finishButtonText}>Finish Registration</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginTop: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  selectText: {
    fontSize: 15,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#111827',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minWidth: 70,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  timeSeparator: {
    paddingTop: 28,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  nextButton: {
    backgroundColor: '#1e5a8e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  finishButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeDisplay: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    minWidth: 90,
  },
  countryCodeText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
});