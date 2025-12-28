import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {  Router } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { FormsModule } from '@angular/forms';
import { PatientProfileService, PatientProfile } from '../../services/patient-profile';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, SharedHeader, FormsModule],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.css',
})
export class PatientDetail implements OnInit {
  activeTab: string = 'vitals';
  patientId!: string;
  patient: PatientProfile | null = null;
  loading: boolean = true;

  showMessageModal: boolean = false;
  messageText: string = '';
  attachedFile: File | null = null;
  selectedAppointment: any = { doctorName: 'John Smith', specialty: 'Patient' }; // Mock data
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientProfileService: PatientProfileService
  ) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.params['id'];
    console.log('Patient ID:', this.patientId);
    this.loadPatientData();
  }

  loadPatientData(): void {
    this.loading = true;
    this.patientProfileService.getPatientById(this.patientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.patient = response.patient;
          console.log('Patient data loaded:', this.patient);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.loading = false;
        alert('Failed to load patient data');
      }
    });
  }

   get patientName(): string {
    return this.patient ? `${this.patient.firstName} ${this.patient.lastName}` : 'Loading...';
  }

  get patientAge(): number {
    if (!this.patient?.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(this.patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get hasAllergies(): boolean {
    return !!(this.patient?.allergies && this.patient.allergies.length > 0);
  }

  get hasMedications(): boolean {
    return !!(this.patient?.currentMedications && this.patient.currentMedications.length > 0);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  cancel(): void {
    this.router.navigate(['doctor-patients']);
  }

  // ✅ ADD THIS METHOD TO OPEN MODAL
  openMessageModal(): void {
    this.showMessageModal = true;
    this.messageText = '';
    this.attachedFile = null;
  }

  // File upload methods
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files.');
        return;
      }

      this.attachedFile = file;
      console.log('File attached:', file.name);
    }
  }

  removeAttachment(): void {
    this.attachedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  sendMessage(): void {
    if (!this.messageText.trim() && !this.attachedFile) {
      return;
    }
    
    console.log('Sending message to: John Smith', this.messageText);
    if (this.attachedFile) {
      console.log('With attachment:', this.attachedFile.name);
    }
    
    // Clear form
    this.messageText = '';
    this.attachedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.messageText = '';
    this.attachedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  

}
