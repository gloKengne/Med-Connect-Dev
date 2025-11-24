import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  iconColor: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  fileSize?: string;
}

interface HealthInfo {
  icon: string;
  iconBg: string;
  title: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

userName: string = 'Sarah';
  
  stats: StatCard[] = [
    {
      title: 'Total Documents',
      value: 47,
      subtitle: '+3 this month',
      icon: '📄',
      iconColor: '#4A90E2'
    },
    {
      title: 'Connected Doctors',
      value: 4,
      subtitle: '2 active',
      icon: '👥',
      iconColor: '#5FB3B3'
    },
    {
      title: 'Upcoming Appointments',
      value: 2,
      subtitle: 'Next: Nov 15',
      icon: '📅',
      iconColor: '#4ECDC4'
    },
    {
      title: 'Health Score',
      value: '85%',
      subtitle: 'Good condition',
      icon: '💓',
      iconColor: '#28A745'
    }
  ];

  recentDocuments: Document[] = [
    {
      id: '1',
      title: 'Blood Test Results',
      category: 'Lab Results',
      categoryColor: '#4A90E2',
      date: '2025-11-08'
    },
    {
      id: '2',
      title: 'Chest X-Ray',
      category: 'Imaging',
      categoryColor: '#5FB3B3',
      date: '2025-11-05'
    },
    {
      id: '3',
      title: 'Prescription - Amoxicillin',
      category: 'Prescription',
      categoryColor: '#FFA07A',
      date: '2025-11-03'
    },
    {
      id: '4',
      title: "Doctor's Notes - Checkup",
      category: 'Clinical Notes',
      categoryColor: '#9B59B6',
      date: '2025-10-30'
    }
  ];

  healthSummary: HealthInfo[] = [
    {
      icon: '🩸',
      iconBg: '#E3F2FD',
      title: 'Blood Type',
      value: 'O+'
    },
    {
      icon: '⚠️',
      iconBg: '#FFEBEE',
      title: 'Allergies',
      value: 'Penicillin, Pollen',
      badge: 'Important',
      badgeColor: '#DC3545'
    },
    {
      icon: '💊',
      iconBg: '#F3E5F5',
      title: 'Current Medications',
      value: '3 prescriptions'
    }
  ];

  showQuickActions: boolean = false;
  healthTip = {
    title: 'Health Tip of the Day',
    content: 'Stay hydrated! Drinking adequate water helps maintain healthy organ function and improves overall well-being.',
    visible: true
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load user data
    this.loadUserData();
  }

  loadUserData(): void {
    // TODO: Fetch user data from service
  }

  viewAllDocuments(): void {
    this.router.navigate(['/records']);
  }

  viewDocument(docId: string): void {
    this.router.navigate(['/records', docId]);
  }

  downloadDocument(docId: string, event: Event): void {
    event.stopPropagation();
    // TODO: Implement download functionality
    console.log('Downloading document:', docId);
  }

  showMoreOptions(docId: string, event: Event): void {
    event.stopPropagation();
    // TODO: Implement more options menu
    console.log('More options for:', docId);
  }

  uploadDocument(): void {
    this.router.navigate(['/records/upload']);
  }

  scheduleAppointment(): void {
    this.router.navigate(['/appointments/schedule']);
  }

  findDoctor(): void {
    this.router.navigate(['/doctors']);
  }

  dismissHealthTip(): void {
    this.healthTip.visible = false;
  }

  scrollDown(): void {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }

   logout(): void {
    // Remove user data from local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }

  

}
