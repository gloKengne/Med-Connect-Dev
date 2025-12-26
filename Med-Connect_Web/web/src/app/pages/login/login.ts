import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    private router: Router
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
      
      // TODO: Implement your authentication service call here
      console.log('Sign in with:', this.signinForm.value);
      
      // Simulated API call
      setTimeout(() => {
        this.loading = false;
        // Navigate to dashboard on success
        // this.router.navigate(['/dashboard']);
      }, 1500);
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
