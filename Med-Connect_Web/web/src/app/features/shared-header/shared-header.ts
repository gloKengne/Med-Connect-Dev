import { Component, Input , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-header.html',
  styleUrl: './shared-header.css',
})
export class SharedHeader  implements OnInit{
  doctorName: string = 'Dr. Patricia';

  @Input() userType: 'patient' | 'doctor' = 'patient';
  @Input() userName: string = '';

  showProfileMenu: boolean = false;
  showRoleSwitcher: boolean = false;

  userRoles = {
    isPatient: true,
    isDoctor: false
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserRoles();
  }

  loadUserRoles(): void {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      this.userRoles = profile.roles || { isPatient: true, isDoctor: false };
      if (!this.userName) {
        this.userName = profile.name || 'User';
      }
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showRoleSwitcher = false;
    }
  }

  toggleRoleSwitcher(): void {
    this.showRoleSwitcher = !this.showRoleSwitcher;
    if (this.showRoleSwitcher) {
      this.showProfileMenu = false;
    }
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showRoleSwitcher = false;
  }

  switchRole(role: 'patient' | 'doctor'): void {
    if (role === 'patient' && this.userRoles.isPatient) {
      this.router.navigate(['/patient-dashboard']);
    } else if (role === 'doctor' && this.userRoles.isDoctor) {
      this.router.navigate(['/doctor-dashboard']);
    }
    this.closeMenus();
  }

  goToSettings(): void {
    this.router.navigate(['/account-settings']);
    this.closeMenus();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    this.router.navigate(['/login']);
  }
}


