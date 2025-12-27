import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';

@Component({
  selector: 'app-dashboard-doctor',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedHeader],
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Show onboarding if first time
    const hasCompletedOnboarding = localStorage.getItem('doctorOnboardingComplete') === 'true';
    if (!hasCompletedOnboarding) {
      this.router.navigate(['/doctor-dashboard/onboarding']);
    }
  }

  

  

}
