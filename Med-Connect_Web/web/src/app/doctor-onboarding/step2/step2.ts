import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../services/onboarding';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step2.html',
  styleUrl: './step2.css',
})
export class Step2 {

  hours: Record<string, string> = {
    Monday: '9:00 AM - 5:00 PM',
    Tuesday: '9:00 AM - 5:00 PM',
    Wednesday: '9:00 AM - 5:00 PM',
    Thursday: '9:00 AM - 5:00 PM',
    Friday: '9:00 AM - 5:00 PM',
    Saturday: 'Closed',
    Sunday: 'Closed'
  };

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private onboardingService: OnboardingService) {}

  close() {
    this.onboardingService.close();
  }

  back() {
    this.onboardingService.previousStep();
  }

  next() {
    this.onboardingService.saveStep2Data({
      availability: this.hours
    });
    this.onboardingService.nextStep();
  }
}
