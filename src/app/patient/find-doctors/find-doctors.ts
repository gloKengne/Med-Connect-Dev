import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedHeader } from '../../features/shared-header/shared-header';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  hospital: string;
  availableToday: boolean;
  isConnected: boolean;
  imageUrl: string;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-find-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedHeader],
  templateUrl: './find-doctors.html',
  styleUrl: './find-doctors.css',
})
export class FindDoctors implements OnInit {

 searchQuery: string = '';
  selectedSpecialty: string = 'all';
  
  specialties = [
    { value: 'all', label: 'All Specialties' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'general', label: 'General Practice' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedic', label: 'Orthopedic Surgery' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'neurology', label: 'Neurology' }
  ];

  allDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Emily Chen',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviewCount: 127,
      hospital: 'City Hospital',
      availableToday: true,
      isConnected: true,
      imageUrl: '/assets/doctors/emily-chen.jpg'
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      specialty: 'General Practitioner',
      rating: 4.8,
      reviewCount: 89,
      hospital: 'Wellness Clinic',
      availableToday: true,
      isConnected: false,
      imageUrl: '/assets/doctors/michael-rodriguez.jpg'
    },
    {
      id: '3',
      name: 'Dr. Sarah Johnson',
      specialty: 'Pediatrician',
      rating: 5.0,
      reviewCount: 156,
      hospital: "Children's Medical Center",
      availableToday: true,
      isConnected: true,
      imageUrl: '/assets/doctors/sarah-johnson.jpg'
    },
    {
      id: '4',
      name: 'Dr. David Kim',
      specialty: 'Orthopedic Surgeon',
      rating: 4.7,
      reviewCount: 94,
      hospital: 'Sports Medicine Institute',
      availableToday: true,
      isConnected: false,
      imageUrl: '/assets/doctors/david-kim.jpg'
    },
    {
      id: '5',
      name: 'Dr. Jennifer Martinez',
      specialty: 'Dermatologist',
      rating: 4.9,
      reviewCount: 112,
      hospital: 'Skin Care Center',
      availableToday: true,
      isConnected: true,
      imageUrl: '/assets/doctors/jennifer-martinez.jpg'
    },
    {
      id: '6',
      name: 'Dr. Robert Taylor',
      specialty: 'Neurologist',
      rating: 4.8,
      reviewCount: 78,
      hospital: 'Brain & Spine Clinic',
      availableToday: true,
      isConnected: false,
      imageUrl: '/assets/doctors/robert-taylor.jpg'
    }
  ];

  filteredDoctors: Doctor[] = [];
  
  // Modal states
  showMessageModal: boolean = false;
  showBookingModal: boolean = false;
  selectedDoctor: Doctor | null = null;
  messageText: string = '';
  
  // Booking form
  appointmentType: string = 'in-person';
  selectedDate: number = 13;
  selectedTime: string = '';
  appointmentReason: string = '';
  
  // Calendar
  calendarDays: CalendarDay[] = [];
  currentMonth: string = 'November 2025';
  
  // Time slots
  availableTimeSlots: string[] = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredDoctors = [...this.allDoctors];
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // current month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  this.currentMonth = firstDay.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const startWeekDay = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  // fill previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startWeekDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      disabled: true,
      isCurrentMonth: false,
      isSelected: false
    });
  }

  // fill current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      isSelected: i === this.selectedDate,
      disabled: false
    });
  }

  // fill next month days until grid = 42 cells
  while (days.length < 42) {
    days.push({
      day: days.length - (startWeekDay + daysInMonth) + 1,
      disabled: true,
      isCurrentMonth: false,
      isSelected: false
    });
  }

  this.calendarDays = days;
}

currentYear = new Date().getFullYear();
currentMonthIndex = new Date().getMonth(); // 0=Jan

prevMonth(): void {
  this.currentMonthIndex--;
  if (this.currentMonthIndex < 0) {
    this.currentMonthIndex = 11;
    this.currentYear--;
  }
  this.updateCalendar();
}

nextMonth(): void {
  this.currentMonthIndex++;
  if (this.currentMonthIndex > 11) {
    this.currentMonthIndex = 0;
    this.currentYear++;
  }
  this.updateCalendar();
}

updateCalendar(): void {
  const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1);
  this.currentMonth = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

  const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekDay = firstDay.getDay();

  const days: CalendarDay[] = [];

  // previous month
  const prevMonthLastDay = new Date(this.currentYear, this.currentMonthIndex, 0).getDate();
  for (let i = startWeekDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      disabled: true,
      isCurrentMonth: false,
      isSelected: false
    });
  }

  // current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      isSelected: i === this.selectedDate,
      disabled: false
    });
  }

  // next month
  while (days.length < 42) {
    days.push({
      day: days.length - (startWeekDay + daysInMonth) + 1,
      disabled: true,
      isCurrentMonth: false,
      isSelected: false
    });
  }

  this.calendarDays = days;
}



  selectDate(day: CalendarDay): void {
    if (day.disabled || !day.isCurrentMonth) return;
    
    this.selectedDate = day.day;
    this.generateCalendarDays();
  }

  selectTimeSlot(time: string): void {
    this.selectedTime = time;
  }

  onSearch(): void {
    this.filterDoctors();
  }

  onSpecialtyChange(): void {
    this.filterDoctors();
  }

  filterDoctors(): void {
    this.filteredDoctors = this.allDoctors.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           doc.specialty.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesSpecialty = this.selectedSpecialty === 'all' || 
                              doc.specialty.toLowerCase().includes(this.selectedSpecialty);
      return matchesSearch && matchesSpecialty;
    });
  }

  openMessageModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.messageText = '';
    this.showMessageModal = true;
    this.showBookingModal = false; 
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.selectedDoctor = null;
    this.messageText = '';
  }

  sendMessage(): void {
    if (this.messageText.trim() && this.selectedDoctor) {
      console.log('Sending message to:', this.selectedDoctor.name, this.messageText);
      // TODO: Implement actual message sending
      alert('Message sent successfully!');
      this.closeMessageModal();
    }
  }

  openBookingModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.appointmentType = 'in-person';
    this.selectedTime = '';
    this.appointmentReason = '';
    this.generateCalendarDays();
    this.showBookingModal = true;
    this.showMessageModal = false;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedDoctor = null;
  }

  confirmBooking(): void {
    if (!this.selectedDate) {
      alert('Please select a date for your appointment.');
      return;
    }
    
    if (!this.selectedTime) {
      alert('Please select a time slot for your appointment.');
      return;
    }
    
    if (this.selectedDoctor) {
      console.log('Booking appointment:', {
        doctor: this.selectedDoctor.name,
        type: this.appointmentType,
        date: `November ${this.selectedDate}, 2025`,
        time: this.selectedTime,
        reason: this.appointmentReason
      });
      
      alert(`Appointment booked successfully with ${this.selectedDoctor.name} on November ${this.selectedDate}, 2025 at ${this.selectedTime}`);
      this.closeBookingModal();
      this.router.navigate(['/appointment']);
    }
  }

  connectWithDoctor(doctor: Doctor): void {
    console.log('Connecting with:', doctor.name);
    // TODO: Implement connection request
    doctor.isConnected = true;
    alert(`Connection request sent to ${doctor.name}!`);
  }

  logout(): void {
    this.router.navigate(['login']);
  }

}
