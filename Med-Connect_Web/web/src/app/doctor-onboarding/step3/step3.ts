import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../services/onboarding';
import { DoctorProfile } from '../../services/doctor-profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './step3.html',
  styleUrl: './step3.css',
})
export class Step3 {
  bio = '';
  isSubmitting = false;

  constructor(
    private onboardingService: OnboardingService,
    private doctorProfileService: DoctorProfile,
    private router: Router
  ) {}

  close() {
    this.onboardingService.close();
  }

  back() {
    this.onboardingService.previousStep();
  }

  complete() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Save bio
    this.onboardingService.saveStep3Data({ bio: this.bio });

    // Get all onboarding data
    const profileData = this.onboardingService.getOnboardingData();

    console.log('Submitting profile data:', profileData);

    // Submit to backend
    this.doctorProfileService.updateProfile(profileData).subscribe({
      next: (response) => {
        console.log('Profile update response:', response);
        
        if (response.success) {
          // Mark onboarding as complete
          this.doctorProfileService.completeOnboarding().subscribe({
            next: (completeResponse) => {
              console.log('Onboarding complete response:', completeResponse);
              this.isSubmitting = false;
              
              // Update localStorage with verified user
              if (completeResponse.user) {
                localStorage.setItem('currentUser', JSON.stringify(completeResponse.user));
              }
              
              this.onboardingService.nextStep(); // Go to success step
            },
            error: (error) => {
              console.error('Error completing onboarding:', error);
              this.isSubmitting = false;
              alert('Profile saved but failed to complete onboarding');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error saving profile:', error);
        this.isSubmitting = false;
        alert('Failed to save profile. Please try again.');
      }
    });
  }
}
