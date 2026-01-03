import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';



interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  iconType: string;
  iconColor: string;
  bgColor: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
}

interface HealthInfo {
  iconType: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  hospital: string;
  availableToday: boolean;
  isConnected: boolean;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedHeader, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

   userName: string = '';
  
  stats: StatCard[] = [
    {
      title: 'Total Documents',
      value: 47,
      subtitle: '+3 this month',
      iconType: 'documents',
      iconColor: '#4A90E2',
      bgColor: '#EBF5FF'
    },
    {
      title: 'Connected Doctors',
      value: 4,
      subtitle: '2 active',
      iconType: 'doctors',
      iconColor: '#5FB3B3',
      bgColor: '#E8F8F8'
    },
    {
      title: 'Upcoming Appointments',
      value: 2,
      subtitle: 'Next: Nov 15',
      iconType: 'appointments',
      iconColor: '#4ECDC4',
      bgColor: '#E6F9F7'
    },
    {
      title: 'Health Score',
      value: '85%',
      subtitle: 'Good condition',
      iconType: 'health',
      iconColor: '#28A745',
      bgColor: '#E8F5E9'
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
      iconType: 'droplet',
      iconBg: '#EBF5FF',
      iconColor: '#4A90E2',
      title: 'Blood Type',
      value: 'O+'
    },
    {
      iconType: 'alert',
      iconBg: '#FFEBEE',
      iconColor: '#DC3545',
      title: 'Allergies',
      value: 'Penicillin, Pollen',
      badge: 'Important',
      badgeColor: '#DC3545'
    },
    {
      iconType: 'pill',
      iconBg: '#F3E5F5',
      iconColor: '#9B59B6',
      title: 'Current Medications',
      value: '3 prescriptions'
    }
  ];

  healthTip = {
    title: 'Health Tip of the Day',
    content: 'Stay hydrated! Drinking adequate water helps maintain healthy organ function and improves overall well-being.',
    visible: true
  };

  // Booking Modal
  showBookingModal: boolean = false;
  selectedDoctor: Doctor | null = null;
  appointmentType: string = 'in-person';
  appointmentReason: string = '';
  
  // Calendar
  calendarDays: CalendarDay[] = [];
  selectedDate: number = 13;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.generateCalendarDays();
  }

  loadUserData(): void {
    // TODO: Fetch user data from service
  }

  generateCalendarDays(): void {
    const days: CalendarDay[] = [];
    
    // Previous month days (last few days of October)
    for (let i = 26; i <= 31; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isSelected: false
      });
    }
    
    // Current month days (November 1-30)
    for (let i = 1; i <= 30; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isSelected: i === this.selectedDate
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isSelected: false
      });
    }
    
    this.calendarDays = days;
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    
    this.selectedDate = day.day;
    this.generateCalendarDays();
  }

  viewAllDocuments(): void {
    this.router.navigate(['/records']);
  }

  viewDocument(docId: string): void {
    this.router.navigate(['/records', docId]);
  }

  downloadDocument(docId: string, event: Event): void {
    event.stopPropagation();
    console.log('Downloading document:', docId);
    // TODO: Implement download functionality
  }

  showMoreOptions(docId: string, event: Event): void {
    event.stopPropagation();
    console.log('More options for:', docId);
    // TODO: Implement more options menu
  }

  scheduleAppointment(): void {
    this.router.navigate(['/appointments/schedule']);
  }

  openBookingModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.appointmentType = 'in-person';
    this.appointmentReason = '';
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedDoctor = null;
  }

  confirmBooking(): void {
    if (this.selectedDate && this.selectedDoctor) {
      console.log('Booking appointment:', {
        doctor: this.selectedDoctor.name,
        type: this.appointmentType,
        date: this.selectedDate,
        reason: this.appointmentReason
      });
      // TODO: Implement actual booking
      this.closeBookingModal();
      this.router.navigate(['/appointments']);
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  

}
