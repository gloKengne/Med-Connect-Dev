import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe'; 
import { SharedHeader } from '../../features/shared-header/shared-header';


interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  status: 'Active' | 'Follow-up' | 'Critical';
  
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule,  FormsModule, FilterPipe, SharedHeader],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {

  searchQuery = '';
  patients: Patient[] = [
    { id: 1, name: 'John Smith', age: 45, gender: 'Male', condition: 'Hypertension', lastVisit: '2025-11-10', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', age: 32, gender: 'Female', condition: 'Diabetes', lastVisit: '2025-11-12', status: 'Active' },
    { id: 3, name: 'Michael Brown', age: 58, gender: 'Male', condition: 'Arthritis', lastVisit: '2025-11-08', status: 'Follow-up' },
    { id: 4, name: 'Emily Davis', age: 28, gender: 'Female', condition: 'Asthma', lastVisit: '2025-11-11', status: 'Active' },
    { id: 5, name: 'Robert Wilson', age: 67, gender: 'Male', condition: 'Heart Disease', lastVisit: '2025-11-09', status: 'Critical' },
    { id: 6, name: 'Jennifer Martinez', age: 41, gender: 'Female', condition: 'Migraine', lastVisit: '2025-11-13', status: 'Active' },
  ];

  getStatusClass(status: string) {
    return {
      'status-active': status === 'Active',
      'status-followup': status === 'Follow-up',
      'status-critical': status === 'Critical'
    };
  }
   
  constructor(private router: Router) {}

  viewRecords(id: number) {
    this.router.navigate(['/doctor-patients', id]);
  }



  // messagePatient() {
  //   // logic here
  // }

   showMessageModal: boolean = false;
  
  // Message form
  messageText: string = '';
  selectedPatient: Patient | null = null;



  
messagePatient(patientId: number) {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      this.selectedPatient = patient;
      this.messageText = '';
      this.showMessageModal = true;
    }
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedPatient = null;
    this.messageText = '';
  }

  sendMessage() {
    if (this.messageText.trim() && this.selectedPatient) {
      console.log('Sending message to:', this.selectedPatient.name, this.messageText);
      this.messageText = '';
    }
  }
 

}
