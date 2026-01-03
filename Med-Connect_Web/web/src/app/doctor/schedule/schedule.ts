import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { RouterLink } from "@angular/router";

interface Appointment {
  time: string;
  patient: string;
  type: string;
  duration: string;
  status: 'Confirmed' | 'Pending';
  mode: 'In-Person' | 'Teleconsult';
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, SharedHeader, RouterLink],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {

  doctorName: string = '';

  appointments: Appointment[] = [
    { time: '09:00 AM', patient: 'John Smith', type: 'Follow-up Checkup', duration: '30 min', status: 'Confirmed', mode: 'In-Person' },
    { time: '10:00 AM', patient: 'Sarah Johnson', type: 'Diabetes Management', duration: '20 min', status: 'Confirmed', mode: 'Teleconsult' },
    { time: '11:30 AM', patient: 'Michael Brown', type: 'X-Ray Review', duration: '45 min', status: 'Pending', mode: 'In-Person' },
    { time: '02:00 PM', patient: 'Emily Davis', type: 'Prescription Renewal', duration: '15 min', status: 'Confirmed', mode: 'Teleconsult' },
  ];

  weeklyStats = [
    { day: 'Mon', date: 'Nov 17', count: 5 },
    { day: 'Tue', date: 'Nov 18', count: 3 },
    { day: 'Wed', date: 'Nov 19', count: 6 },
    { day: 'Thu', date: 'Nov 20', count: 8 },
    { day: 'Fri', date: 'Nov 21', count: 7 },
  ];

}
