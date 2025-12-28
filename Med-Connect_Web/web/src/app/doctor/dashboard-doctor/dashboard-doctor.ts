import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { OnboardingComponent } from '../../features/onboarding/onboarding'; 
import { OnboardingService } from '../../services/onboarding';

@Component({
  selector: 'app-dashboard-doctor',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedHeader, OnboardingComponent],
  templateUrl: './dashboard-doctor.html',
  styleUrl: './dashboard-doctor.css',
})
export class DashboardDoctor implements OnInit {
doctorName: string = 'Dr. Patricia';
  
  stats = [
    { label: 'Total Patients', value: 142, subtitle: '+8 this month', icon: '👥', color: '#4A90E2', iconType: 'patients'},
    { label: "Today's Appointments", value: 12, subtitle: '3 remaining', icon: '📅', color: '#5FB3B3', iconType: 'appointments'},
    { label: 'Pending Reviews', value: 7, subtitle: 'Lab results & imaging', icon: '📋', color: '#FF6B6B', iconType: 'reviews'},
    { label: 'Active Consultations', value: 4, subtitle: 'In progress', icon: '💬', color: '#4A90E2', iconType: 'consults'}
  ];

  constructor(
    private router: Router,
    public onboardingService: OnboardingService
  ) {
    console.log('🟢 DashboardDoctor: Constructor called');
  }

  ngOnInit(): void {
    console.log('🟢 DashboardDoctor: ngOnInit called');
    this.loadDoctorInfo();
    
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      this.checkOnboardingStatus();
    }, 100);
  }

  private loadDoctorInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    console.log('🟢 DashboardDoctor: storedUser =', storedUser);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.doctorName = `Dr. ${user.firstName} ${user.lastName}`;
        console.log('🟢 DashboardDoctor: Loaded user:', user);
      } catch (error) {
        console.error('🔴 Error parsing user:', error);
      }
    }
  }

  private checkOnboardingStatus(): void {
    console.log('🟢 DashboardDoctor: Checking onboarding status...');
    
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('🟢 User type:', user.userType);
      console.log('🟢 Is verified:', user.isVerified);
      
      // If doctor is not verified, show onboarding modal
      if (user.userType === 'doctor' && !user.isVerified) {
        console.log('🟢 ✅ Opening onboarding modal!');
        this.onboardingService.open();
      } else {
        console.log('🟡 User is verified or not a doctor - not showing onboarding');
      }
    } else {
      console.warn('🟡 No user found in localStorage');
    }
  }


}
