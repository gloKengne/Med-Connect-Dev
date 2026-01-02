import { Component, Input , OnInit , OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { NotificationService, Notification } from '../../services/notification';
import { ConnectionService} from '../../services/connection';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-header.html',
  styleUrl: './shared-header.css',
})
export class SharedHeader  implements OnInit, OnDestroy{
 @Input() userType: 'patient' | 'doctor' = 'patient';
  @Input() userName: string = '';

  showProfileMenu: boolean = false;
  showRoleSwitcher: boolean = false;
  showNotificationDropdown: boolean = false;

  userRoles = {
    isPatient: true,
    isDoctor: false
  };

  // Notifications
  notifications: Notification[] = [];
  unreadCount: number = 0;
  private unreadCountSubscription?: Subscription;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private connection: ConnectionService
  ) {}

  ngOnInit(): void {
    this.loadUserFromAuth();
    this.loadNotifications();
    
    // Subscribe to unread count updates
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      count => this.unreadCount = count
    );
    
    // Initial load of unread count
    this.notificationService.getUnreadCount().subscribe();
  }

  ngOnDestroy(): void {
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  loadUserFromAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = `${user.firstName} ${user.lastName}`;
      this.userType = user.userType;
      
      this.userRoles = {
        isPatient: user.userType === 'patient',
        isDoctor: user.userType === 'doctor'
      };
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        if (response.success && response.notifications) {
          this.notifications = response.notifications;
          console.log('Loaded notifications:', this.notifications);
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showProfileMenu = false;
      this.showRoleSwitcher = false;
      this.loadNotifications(); // Reload when opening
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.showRoleSwitcher = false;
      this.showNotificationDropdown = false;
    }
  }

  toggleRoleSwitcher(): void {
    this.showRoleSwitcher = !this.showRoleSwitcher;
    if (this.showRoleSwitcher) {
      this.showProfileMenu = false;
      this.showNotificationDropdown = false;
    }
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showRoleSwitcher = false;
    this.showNotificationDropdown = false;
  }

  markNotificationAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.isRead = true;
          this.loadNotifications(); // Refresh list
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  handleConnectionResponse(notification: Notification, action: 'accept' | 'reject'): void {
    console.log('=== Handling Connection Response ===');
    console.log('Notification:', notification);
    console.log('Action:', action);
    
    if (!notification.relatedConnection) {
      console.error('No related connection found');
      alert('Error: Connection information is missing');
      return;
    }

    console.log('Connection ID:', notification.relatedConnection._id);
    console.log('Connection Status:', notification.relatedConnection.status);

    // Check if already processed
    if (notification.relatedConnection.status !== 'pending') {
      alert(`This connection has already been ${notification.relatedConnection.status}`);
      this.loadNotifications();
      return;
    }

    this.connection.respondToConnection(notification.relatedConnection._id, action).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        if (response.success) {
          alert(`Connection ${action}ed successfully!`);
          this.markNotificationAsRead(notification);
          this.loadNotifications();
          
          // Refresh unread count
          this.notificationService.refreshUnreadCount();
        } else {
          console.error('Response not successful:', response);
          alert(response.message || `Failed to ${action} connection`);
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing connection:`, error);
        console.error('Error details:', error.error);
        
        let errorMessage = `Failed to ${action} connection.`;
        if (error.error && error.error.message) {
          errorMessage += ` ${error.error.message}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CONNECTION_REQUEST':
        return 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2';
      case 'CONNECTION_ACCEPTED':
        return 'M20 6 9 17 4 12';
      case 'CONNECTION_REJECTED':
        return 'M18 6 6 18M6 6l12 12';
      default:
        return 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
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


