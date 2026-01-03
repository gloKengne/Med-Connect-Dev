import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message';
import { ConnectionService } from '../../services/connection';

interface Appointmentattributes {
  id: string;
  doctorId?: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  imageUrl: string;
  connectionId?: string;
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, SharedHeader, FormsModule],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css',
})
export class Appointment implements OnInit{
 userName: string = '';
  activeTab: 'upcoming' | 'past' = 'upcoming';
  
  appointments: Appointmentattributes[] = [
    {
      id: '1',
      doctorName: 'Dr. Emily Chen',
      specialty: 'Cardiologist',
      date: 'Sat, Nov 15, 2025',
      time: '10:00 AM',
      location: 'City Hospital',
      status: 'confirmed',
      type: 'in-person',
      imageUrl: '/assets/doctors/emily-chen.jpg'
    },
    {
      id: '2',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Pediatrician',
      date: 'Tue, Nov 18, 2025',
      time: '2:30 PM',
      location: "Children's Medical Center",
      status: 'confirmed',
      type: 'video',
      imageUrl: '/assets/doctors/sarah-johnson.jpg'
    },
    {
      id: '3',
      doctorName: 'Dr. Jennifer Martinez',
      specialty: 'Dermatologist',
      date: 'Sat, Nov 22, 2025',
      time: '11:15 AM',
      location: 'Skin Care Center',
      status: 'pending',
      type: 'in-person',
      imageUrl: '/assets/doctors/jennifer-martinez.jpg'
    }
  ];

  filteredAppointments: Appointmentattributes[] = [];
  selectedAppointment: Appointmentattributes | null = null;
  
  // Modal states
  showCancelModal: boolean = false;
  showMessageModal: boolean = false;
  
  // Message form
  messageText: string = '';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.filterAppointments();
    this.loadConnectionIds();
  }

  loadUserInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = `${user.firstName} ${user.lastName}`;
    }
  }

  loadConnectionIds(): void {
    // Get all patient connections to match with appointments
    this.connectionService.getPatientConnections().subscribe({
      next: (response) => {
        if (response.success && response.connections) {
          // Create a map of doctor names to connection IDs
          const connectionMap = new Map();
          response.connections.forEach(conn => {
            if (conn.status === 'accepted') {
              const doctor = conn.doctor as any;
              const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
              connectionMap.set(doctorName, conn._id);
            }
          });

          // Update appointments with connection IDs
          this.appointments = this.appointments.map(appt => ({
            ...appt,
            connectionId: connectionMap.get(appt.doctorName)
          }));

          this.filterAppointments();
        }
      },
      error: (error) => {
        console.error('Error loading connections:', error);
      }
    });
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
    this.filterAppointments();
  }

  filterAppointments(): void {
    // For now, just show all as upcoming
    // In production, you'd filter by date
    this.filteredAppointments = [...this.appointments];
  }

  openCancelModal(appointment: Appointmentattributes): void {
    this.selectedAppointment = appointment;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedAppointment = null;
  }

  confirmCancel(): void {
    if (this.selectedAppointment) {
      console.log('Cancelling appointment:', this.selectedAppointment.id);
      this.selectedAppointment.status = 'cancelled';
      this.closeCancelModal();
    }
  }

  openMessageModal(appointment: Appointmentattributes): void {
    if (!appointment.connectionId) {
      alert('Connection not found. Please make sure you are connected with this doctor.');
      return;
    }

    this.selectedAppointment = appointment;
    this.messageText = '';
    this.showMessageModal = true;
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.selectedAppointment = null;
    this.messageText = '';
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedAppointment || !this.selectedAppointment.connectionId) {
      return;
    }

    this.messageService.sendMessage(
      this.selectedAppointment.connectionId,
      this.messageText.trim()
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Message sent successfully!');
          this.messageText = '';
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    });
  }

  joinVideoCall(appointment: Appointmentattributes): void {
    console.log('Joining video call:', appointment.id);
    // TODO: Implement video call functionality
    alert('Video call feature coming soon!');
  }

  logout(): void {
    this.router.navigate(['login']);
  }

}
