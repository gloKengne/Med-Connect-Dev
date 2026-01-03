import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Message {
  _id?: string;
  connection: string;
  sender: string;
  receiver: string;
  content: string;
  isRead: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  connectionId: string;
  participantId: string;
  participantName: string;
  participantRole: 'doctor' | 'patient';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface MessageResponse {
  success: boolean;
  message?: Message;
  messages?: Message[];
  conversations?: Conversation[];
  unreadCount?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {

  
  private apiUrl = 'http://localhost:5000/api/messages';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Send a message
  sendMessage(connectionId: string, content: string, attachment?: File): Observable<MessageResponse> {
    console.log('📤 Sending message:', { connectionId, content, hasAttachment: !!attachment });

    const formData = new FormData();
    formData.append('connectionId', connectionId);
    formData.append('content', content);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    // For FormData, don't set Content-Type header (browser will set it with boundary)
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<MessageResponse>(
      this.apiUrl,
      formData,
      { headers }
    ).pipe(
      tap(response => {
        console.log('✅ Message sent:', response);
        this.loadUnreadCount(); // Refresh unread count
      }),
      catchError(error => {
        console.error('❌ Send message error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get messages for a connection
  getMessages(connectionId: string): Observable<MessageResponse> {
    console.log('📥 Fetching messages for connection:', connectionId);

    return this.http.get<MessageResponse>(
      `${this.apiUrl}/connection/${connectionId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('✅ Messages retrieved:', response);
        // Don't auto-mark as read here - let the component decide
        // This prevents marking messages as read when just polling for updates
      }),
      catchError(error => {
        console.error('❌ Get messages error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all conversations for current user
  getConversations(): Observable<MessageResponse> {
    console.log('📋 Fetching conversations...');

    return this.http.get<MessageResponse>(
      `${this.apiUrl}/conversations`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('✅ Conversations retrieved:', response);
        if (response.conversations) {
          const totalUnread = response.conversations.reduce(
            (sum, conv) => sum + conv.unreadCount, 
            0
          );
          this.unreadCountSubject.next(totalUnread);
        }
      }),
      catchError(error => {
        console.error('❌ Get conversations error:', error);
        return throwError(() => error);
      })
    );
  }

  // Mark messages as read
  markAsRead(connectionId: string): Observable<MessageResponse> {
    console.log('✓ Marking messages as read:', connectionId);

    return this.http.patch<MessageResponse>(
      `${this.apiUrl}/connection/${connectionId}/read`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        console.log('✅ Messages marked as read');
        this.loadUnreadCount();
      }),
      catchError(error => {
        console.error('❌ Mark as read error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get unread message count
  getUnreadCount(): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      `${this.apiUrl}/unread-count`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && typeof response.unreadCount === 'number') {
          this.unreadCountSubject.next(response.unreadCount);
        }
      }),
      catchError(error => {
        console.error('❌ Get unread count error:', error);
        return throwError(() => error);
      })
    );
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Delete a message
  deleteMessage(messageId: string): Observable<MessageResponse> {
    console.log('🗑️ Deleting message:', messageId);

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${messageId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('✅ Message deleted:', response)),
      catchError(error => {
        console.error('❌ Delete message error:', error);
        return throwError(() => error);
      })
    );
  }

  
  
}
