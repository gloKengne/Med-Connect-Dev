import { Component, OnInit} from '@angular/core';
import { Onboarding } from '../../services/onboarding';
import { CommonModule } from '@angular/common';
import { Step1 } from '../../doctor-onboarding/step1/step1';
import { Step2 } from '../../doctor-onboarding/step2/step2';
import { Step3 } from '../../doctor-onboarding/step3/step3';
import { Step4 } from '../../doctor-onboarding/step4/step4';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, Step1, Step2, Step3, Step4, RouterModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class OnboardingLayout implements OnInit {
  // showStep1 = true;
  // showStep2 = true;
  // showStep3 = true;
  // showStep4 = true;

  

  constructor(public onboardingService: Onboarding) {}

  ngOnInit() {
    const hasCompleted = localStorage.getItem('doctorOnboardingComplete') === 'true';
    if (!hasCompleted) {
      setTimeout(() => this.onboardingService.open(), 500); // small delay for smooth load
    }
  }

}
