import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {  Router } from '@angular/router';
import { SharedHeader } from '../../features/shared-header/shared-header';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, SharedHeader],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.css',
})
export class PatientDetail implements OnInit {
  activeTab: string = 'vitals';
  patientId!: string; // declare without initializing

  constructor(
    private route: ActivatedRoute,
    private router: Router   // ✅ Add Router here
  ) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.params['id']; // ✅ safe to use here
    console.log('Patient ID:', this.patientId);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  cancel(): void {
    this.router.navigate(['doctor-patients']);
  }

  

}
