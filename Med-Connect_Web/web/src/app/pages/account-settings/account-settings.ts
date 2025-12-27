import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  roles: {
    isPatient: boolean;
    isDoctor: boolean;
  };
  patientInfo?: {
    bloodType: string;
    allergies: string;
    emergencyContact: string;
  };
  doctorInfo?: {
    specialty: string;
    licenseNumber: string;
    hospital: string;
    yearsOfExperience: number;
  };
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css',
})
export class AccountSettings implements OnInit {

activeTab: 'profile' | 'roles' | 'security' = 'profile';
  
  userProfile: UserProfile = {
    name: 'Dr. Patricia',
    email: 'patricia@medconnect.com',
    phone: '+1 (555) 123-4567',
    roles: {
      isPatient: false,
      isDoctor: true
    },
    doctorInfo: {
      specialty: 'Cardiology',
      licenseNumber: 'MD-12345',
      hospital: 'Central Medical Center',
      yearsOfExperience: 12
    }
  };

  // Password change
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // Role activation
  showRoleActivation: boolean = false;
  pendingRole: 'patient' | 'doctor' | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // TODO: Load from service
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      this.userProfile = JSON.parse(storedProfile);
    }
  }

  setActiveTab(tab: 'profile' | 'roles' | 'security'): void {
    this.activeTab = tab;
  }

  saveProfile(): void {
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    alert('Profile updated successfully!');
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (this.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    // TODO: Implement password change
    alert('Password changed successfully!');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  requestRoleActivation(role: 'patient' | 'doctor'): void {
    this.pendingRole = role;
    this.showRoleActivation = true;
  }

  requestRoleDeactivation(role: 'patient' | 'doctor'): void {
    // Prevent deactivating if it's the only active role
    if (role === 'patient' && !this.userProfile.roles.isDoctor) {
      alert('Cannot deactivate Patient role. You must have at least one active role.');
      return;
    }
    if (role === 'doctor' && !this.userProfile.roles.isPatient) {
      alert('Cannot deactivate Doctor role. You must have at least one active role.');
      return;
    }
    
    const confirmDeactivate = confirm(
      `Are you sure you want to deactivate your ${role === 'patient' ? 'Patient' : 'Doctor'} role? You can reactivate it anytime.`
    );
    
    if (confirmDeactivate) {
      if (role === 'patient') {
        this.userProfile.roles.isPatient = false;
      } else {
        this.userProfile.roles.isDoctor = false;
      }
      this.saveProfile();
      alert(`${role === 'patient' ? 'Patient' : 'Doctor'} role deactivated successfully.`);
      
      // Redirect to the active role dashboard
      if (role === 'patient' && this.userProfile.roles.isDoctor) {
        this.router.navigate(['/doctor-dashboard']);
      } else if (role === 'doctor' && this.userProfile.roles.isPatient) {
        this.router.navigate(['/patient-dashboard']);
      }
    }
  }

  confirmRoleActivation(): void {
    if (this.pendingRole === 'patient') {
      this.userProfile.roles.isPatient = true;
      if (!this.userProfile.patientInfo) {
        this.userProfile.patientInfo = {
          bloodType: '',
          allergies: '',
          emergencyContact: ''
        };
      }
    } else if (this.pendingRole === 'doctor') {
      this.userProfile.roles.isDoctor = true;
      if (!this.userProfile.doctorInfo) {
        this.userProfile.doctorInfo = {
          specialty: '',
          licenseNumber: '',
          hospital: '',
          yearsOfExperience: 0
        };
      }
    }
    this.saveProfile();
    this.closeRoleActivation();
    alert(`${this.pendingRole === 'patient' ? 'Patient' : 'Doctor'} role activated! Please complete your profile.`);
  }

  closeRoleActivation(): void {
    this.showRoleActivation = false;
    this.pendingRole = null;
  }

  goBack(): void {
    this.router.navigate(['/patient-dashboard']);
  }

}
