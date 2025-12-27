import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  signinForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: Auth
  ) {
    this.signinForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.signinForm.get('email');
  }

  get password() {
    return this.signinForm.get('password');
  }

  onSubmit() {
    if (this.signinForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const credentials = {
        email: this.signinForm.value.email,
        password: this.signinForm.value.password
      };
      
      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            // Redirect based on user type
            const userType = this.authService.currentUserValue?.userType;
            if (userType === 'patient') {
              this.router.navigate(['/patient-dashboard']);
            } else if (userType === 'doctor') {
              this.router.navigate(['/doctor-dashboard']);
            }
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
    } else {
      Object.keys(this.signinForm.controls).forEach(key => {
        this.signinForm.get(key)?.markAsTouched();
      });
    }
  }

  navigateToSignUp() {
    this.router.navigate(['signup']);
  }

}
