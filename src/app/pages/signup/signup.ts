import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['patient', Validators.required]
    });
  }

  get fullName() {
    return this.signupForm.get('fullName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get userType() {
    return this.signupForm.get('userType');
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      // TODO: Implement your authentication service call here
      console.log('Sign up with:', this.signupForm.value);
      
      // Simulated API call
      setTimeout(() => {
        this.loading = false;
        // Navigate to verification or dashboard on success
        // this.router.navigate(['/auth/verify-email']);
      }, 1500);
    } else {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  navigateToSignIn() {
    this.router.navigate(['login']);
  }

}
