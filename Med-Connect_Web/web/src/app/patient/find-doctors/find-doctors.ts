import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { DoctorService, Doctor } from '../../services/doctor';
import { ConnectionService } from '../../services/connection';

interface DoctorDisplay extends Doctor {
  isConnected: boolean;
  isPending: boolean;
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

  userName: string = '';
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

  allDoctors: DoctorDisplay[] = [];
  filteredDoctors: DoctorDisplay[] = [];
  isLoading: boolean = false;
  
  // Modal states
  showMessageModal: boolean = false;
  showBookingModal: boolean = false;
  selectedDoctor: DoctorDisplay | null = null;
  messageText: string = '';
  
  // Booking form
  appointmentType: string = 'in-person';
  selectedDate: number = 13;
  selectedTime: string = '';
  appointmentReason: string = '';
  
  // Calendar
  calendarDays: CalendarDay[] = [];
  currentMonth: string = 'November 2025';
  currentYear = new Date().getFullYear();
  currentMonthIndex = new Date().getMonth();
  
  // Time slots
  availableTimeSlots: string[] = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  constructor(
    private router: Router,
    private DoctorService: DoctorService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDoctors();
    this.generateCalendarDays();
  }

  loadUserInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = `${user.firstName} ${user.lastName}`;
    }
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.DoctorService.getAllDoctors(this.selectedSpecialty, this.searchQuery)
      .subscribe({
        next: (response) => {
          if (response.success && response.doctors) {
            // Map backend doctors to display format
            this.allDoctors = response.doctors.map(doc => ({
              ...doc,
              isConnected: false,
              isPending: false
            }));
            
            // Check connection status for each doctor
            this.checkConnectionStatuses();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
          this.isLoading = false;
          alert('Failed to load doctors. Please try again.');
        }
      });
  }

  checkConnectionStatuses(): void {
    this.allDoctors.forEach((doctor, index) => {
      this.connectionService.checkConnection(doctor._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.allDoctors[index].isConnected = response.isConnected || false;
            this.allDoctors[index].isPending = response.isPending || false;
          }
          // Update filtered doctors after checking all
          if (index === this.allDoctors.length - 1) {
            this.filterDoctors();
          }
        },
        error: (error) => {
          console.error('Error checking connection:', error);
        }
      });
    });
  }

  onSearch(): void {
    this.loadDoctors();
  }

  onSpecialtyChange(): void {
    this.loadDoctors();
  }

  filterDoctors(): void {
    this.filteredDoctors = [...this.allDoctors];
  }

  connectWithDoctor(doctor: DoctorDisplay): void {
    if (doctor.isPending) {
      alert('Connection request already sent and pending approval.');
      return;
    }

    this.connectionService.requestConnection(doctor._id).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Connection request sent to Dr. ${doctor.firstName} ${doctor.lastName}!`);
          doctor.isPending = true;
        }
      },
      error: (error) => {
        console.error('Error requesting connection:', error);
        alert('Failed to send connection request. Please try again.');
      }
    });
  }

  getFullDoctorName(doctor: DoctorDisplay): string {
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  }

  openMessageModal(doctor: DoctorDisplay): void {
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
      console.log('Sending message to:', this.selectedDoctor.firstName, this.messageText);
      alert('Message sent successfully!');
      this.closeMessageModal();
    }
  }

  openBookingModal(doctor: DoctorDisplay): void {
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
        doctor: `${this.selectedDoctor.firstName} ${this.selectedDoctor.lastName}`,
        type: this.appointmentType,
        date: `${this.currentMonth} ${this.selectedDate}`,
        time: this.selectedTime,
        reason: this.appointmentReason
      });
      
      alert(`Appointment booked successfully with ${this.getFullDoctorName(this.selectedDoctor)} on ${this.currentMonth} ${this.selectedDate} at ${this.selectedTime}`);
      this.closeBookingModal();
      this.router.navigate(['/appointment']);
    }
  }

  // Calendar methods
  generateCalendarDays(): void {
    const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1);
    const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0);

    this.currentMonth = firstDay.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });

    const startWeekDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days: CalendarDay[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonthIndex, 0).getDate();
    for (let i = startWeekDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        disabled: true,
        isCurrentMonth: false,
        isSelected: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isSelected: i === this.selectedDate,
        disabled: false
      });
    }

    // Next month days
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

  prevMonth(): void {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    }
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.generateCalendarDays();
  }

  selectDate(day: CalendarDay): void {
    if (day.disabled || !day.isCurrentMonth) return;
    this.selectedDate = day.day;
    this.generateCalendarDays();
  }

  selectTimeSlot(time: string): void {
    this.selectedTime = time;
  }
}
