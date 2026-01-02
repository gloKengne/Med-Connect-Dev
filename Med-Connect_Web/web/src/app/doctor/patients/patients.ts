import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe'; 
import { SharedHeader } from '../../features/shared-header/shared-header';
import { ConnectionService, Connection } from '../../services/connection';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  status: 'Active' | 'Follow-up' | 'Critical';
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule,  FormsModule, FilterPipe, SharedHeader],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  doctorName: string = '';
  searchQuery = '';
  patients: Patient[] = [];
  isLoading: boolean = false;
  
  showMessageModal: boolean = false;
  messageText: string = '';
  selectedPatient: Patient | null = null;

  constructor(
    private router: Router,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadDoctorInfo();
    this.loadConnectedPatients();
  }

  loadDoctorInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.doctorName = `Dr. ${user.firstName} ${user.lastName}`;
      console.log('👨‍⚕️ Doctor loaded:', this.doctorName);
    }
  }

  loadConnectedPatients(): void {
    this.isLoading = true;
    console.log('📋 Loading connected patients...');
    
    this.connectionService.getDoctorConnections().subscribe({
      next: (response) => {
        console.log('✅ Response received:', response);
        
        if (response.success && response.connections) {
          console.log('📊 Connections:', response.connections);
          
          // Map connections to patient format
          this.patients = response.connections
            .map(conn => {
              try {
                return this.mapConnectionToPatient(conn);
              } catch (error) {
                console.error('Error mapping connection:', conn, error);
                return null;
              }
            })
            .filter(patient => patient !== null) as Patient[];
          
          console.log('✅ Mapped patients:', this.patients);
          
          if (this.patients.length === 0) {
            console.log('ℹ️ No connected patients found');
          }
        } else {
          console.warn('⚠️ No connections in response');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading connected patients:', error);
        console.error('Error details:', error.error);
        this.isLoading = false;
        
        let errorMessage = 'Failed to load patients. ';
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
      }
    });
  }

  mapConnectionToPatient(connection: Connection): Patient {
    console.log('🔄 Mapping connection:', connection);
    
    if (!connection.patient) {
      console.error('❌ No patient data in connection:', connection);
      throw new Error('Patient data missing');
    }
    
    const patient = connection.patient;
    
    // Handle different possible ID fields
    const patientId = (patient as any)._id || (patient as any).userId || '';
    
    if (!patientId) {
      console.error('❌ No patient ID found:', patient);
      throw new Error('Patient ID missing');
    }
    
    const mappedPatient: Patient = {
      id: patientId,
      name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
      age: this.calculateAge(patient.dateOfBirth),
      gender: patient.gender || 'Not specified',
      condition: 'General Care',
      lastVisit: this.formatDate(connection.updatedAt),
      status: 'Active',
      email: patient.email,
      phone: patient.phone
    };
    
    console.log('✅ Mapped patient:', mappedPatient);
    return mappedPatient;
  }

  calculateAge(dateOfBirth?: string): number {
    if (!dateOfBirth) {
      console.log('⚠️ No date of birth provided');
      return 0;
    }
    
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      if (isNaN(birthDate.getTime())) {
        console.warn('⚠️ Invalid date of birth:', dateOfBirth);
        return 0;
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('❌ Error calculating age:', error);
      return 0;
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date string:', dateString);
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'N/A';
    }
  }

  getStatusClass(status: string) {
    return {
      'status-active': status === 'Active',
      'status-followup': status === 'Follow-up',
      'status-critical': status === 'Critical'
    };
  }

  viewRecords(id: string) {
    console.log('👁️ Viewing records for patient:', id);
    this.router.navigate(['/doctor-patients', id]);
  }

  messagePatient(patientId: string) {
    console.log('💬 Opening message modal for patient:', patientId);
    const patient = this.patients.find(p => p.id === patientId);
    
    if (patient) {
      this.selectedPatient = patient;
      this.messageText = '';
      this.showMessageModal = true;
    } else {
      console.error('❌ Patient not found:', patientId);
    }
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedPatient = null;
    this.messageText = '';
  }

  sendMessage() {
    if (this.messageText.trim() && this.selectedPatient) {
      console.log('📤 Sending message to:', this.selectedPatient.name, this.messageText);
      // TODO: Implement actual message sending via messaging service
      alert('Message sent successfully!');
      this.messageText = '';
      this.closeMessageModal();
    }
  }
 

}
