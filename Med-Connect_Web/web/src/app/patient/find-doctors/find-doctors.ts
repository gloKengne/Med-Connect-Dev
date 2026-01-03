import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { DoctorService, Doctor } from '../../services/doctor';
import { ConnectionService } from '../../services/connection';
import { MessageService } from '../../services/message';

interface DoctorDisplay extends Doctor {
  isConnected: boolean;
  isPending: boolean;
  connectionId?: string;
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
  currentUserId: string = '';
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
  selectedDoctor: DoctorDisplay | null = null;
  messageText: string = '';

  constructor(
    private router: Router,
    private DoctorService: DoctorService,
    private connectionService: ConnectionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDoctors();
  }

  loadUserInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserId = user.id || user._id;
      this.userName = `${user.firstName} ${user.lastName}`;
      console.log('👤 Patient loaded:', this.userName, 'ID:', this.currentUserId);
    }
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.DoctorService.getAllDoctors(this.selectedSpecialty, this.searchQuery)
      .subscribe({
        next: (response) => {
          if (response.success && response.doctors) {
            console.log('✅ Doctors loaded:', response.doctors.length);
            this.allDoctors = response.doctors.map(doc => ({
              ...doc,
              isConnected: false,
              isPending: false,
              connectionId: undefined
            }));
            
            this.checkConnectionStatuses();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading doctors:', error);
          this.isLoading = false;
          alert('Failed to load doctors. Please try again.');
        }
      });
  }

  checkConnectionStatuses(): void {
    console.log('🔍 Checking connection statuses...');
    
    // Get all patient connections first
    this.connectionService.getPatientConnections().subscribe({
      next: (response) => {
        if (response.success && response.connections) {
          console.log('✅ Patient connections:', response.connections.length);
          
          // Create a map of doctor IDs to connection info
          const connectionMap = new Map();
          response.connections.forEach(conn => {
            const doctorId = (conn.doctor as any)._id || (conn.doctor as any).userId;
            connectionMap.set(doctorId, {
              isConnected: conn.status === 'accepted',
              isPending: conn.status === 'pending',
              connectionId: conn._id
            });
            console.log('📝 Mapped connection for doctor:', doctorId, conn.status);
          });

          // Update doctors with connection status
          this.allDoctors = this.allDoctors.map(doctor => {
            const connInfo = connectionMap.get(doctor._id);
            if (connInfo) {
              console.log(`✅ Doctor ${doctor.firstName} ${doctor.lastName}:`, connInfo);
            }
            return {
              ...doctor,
              isConnected: connInfo?.isConnected || false,
              isPending: connInfo?.isPending || false,
              connectionId: connInfo?.connectionId
            };
          });

          this.filterDoctors();
        }
      },
      error: (error) => {
        console.error('❌ Error checking connections:', error);
        this.filterDoctors();
      }
    });
  }

  onSearch(): void {
    console.log('🔍 Searching with query:', this.searchQuery);
    this.loadDoctors();
  }

  onSpecialtyChange(): void {
    console.log('🏥 Specialty changed to:', this.selectedSpecialty);
    this.loadDoctors();
  }

  filterDoctors(): void {
    this.filteredDoctors = [...this.allDoctors];
    console.log('📋 Filtered doctors:', this.filteredDoctors.length);
  }

  connectWithDoctor(doctor: DoctorDisplay): void {
    if (doctor.isPending) {
      alert('Connection request already sent and pending approval.');
      return;
    }

    if (doctor.isConnected) {
      alert('You are already connected with this doctor.');
      return;
    }

    console.log('🔗 Requesting connection to doctor:', doctor._id);

    this.connectionService.requestConnection(doctor._id).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Connection request sent');
          alert(`Connection request sent to Dr. ${doctor.firstName} ${doctor.lastName}!`);
          doctor.isPending = true;
        }
      },
      error: (error) => {
        console.error('❌ Error requesting connection:', error);
        alert('Failed to send connection request. Please try again.');
      }
    });
  }

  getFullDoctorName(doctor: DoctorDisplay): string {
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  }

  openMessageModal(doctor: DoctorDisplay): void {
    if (!doctor.isConnected) {
      alert('You must be connected to message this doctor.');
      return;
    }

    if (!doctor.connectionId) {
      alert('Connection ID not found. Please refresh the page.');
      return;
    }

    console.log('💬 Opening message modal for doctor:', doctor.firstName, doctor.lastName);
    console.log('🔗 Connection ID:', doctor.connectionId);

    this.selectedDoctor = doctor;
    this.messageText = '';
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.selectedDoctor = null;
    this.messageText = '';
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedDoctor || !this.selectedDoctor.connectionId) {
      console.warn('⚠️ Cannot send: missing message or connection');
      return;
    }

    console.log('📤 Sending message:', {
      connectionId: this.selectedDoctor.connectionId,
      message: this.messageText,
      doctor: this.getFullDoctorName(this.selectedDoctor)
    });

    this.messageService.sendMessage(
      this.selectedDoctor.connectionId,
      this.messageText.trim()
    ).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Message sent successfully');
          alert('Message sent successfully!');
          this.closeMessageModal();
        }
      },
      error: (error) => {
        console.error('❌ Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    });
  }

  openBookingModal(doctor: DoctorDisplay): void {
    console.log('📅 Opening booking modal for:', doctor.firstName, doctor.lastName);
    // Navigate to appointments or open booking modal
    alert('Appointment booking feature coming soon!');
  }
}
