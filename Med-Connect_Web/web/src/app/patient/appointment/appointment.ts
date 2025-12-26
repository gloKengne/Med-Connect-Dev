import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { FormsModule } from '@angular/forms';

interface Appointmentattributes {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  imageUrl: string;
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, SharedHeader, FormsModule],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css',
})
export class Appointment implements OnInit{
  userName: string = 'Sarah';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filterAppointments();
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
    this.filterAppointments();
  }

  filterAppointments(): void {
    // For now, just show all as upcoming
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
      // TODO: Implement actual cancellation
      this.selectedAppointment.status = 'cancelled';
      this.closeCancelModal();
    }
  }

  openMessageModal(appointment: Appointmentattributes): void {
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
    if (this.messageText.trim() && this.selectedAppointment) {
      console.log('Sending message to:', this.selectedAppointment.doctorName, this.messageText);
      // TODO: Implement actual message sending
      this.messageText = '';
      // Optionally close modal after sending
      // this.closeMessageModal();
    }
  }

  joinVideoCall(appointment: Appointmentattributes): void {
    console.log('Joining video call:', appointment.id);
    // TODO: Implement video call functionality
  }

  logout(): void {
    this.router.navigate(['login']);
  }

}
