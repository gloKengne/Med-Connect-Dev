import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SharedHeader } from '../../features/shared-header/shared-header';
import { FormsModule } from '@angular/forms';

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online: boolean;
}

interface Message {
   text: string;
  time: string;
  isDoctor: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, SharedHeader, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements AfterViewChecked{
  doctorName: string = 'Dr. Patricia';

 @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesArea') messagesArea!: ElementRef<HTMLDivElement>;

  conversations: Conversation[] = [
    { id: 1, name: 'John Smith', lastMessage: 'Thank you for the prescription', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'Sarah Johnson', lastMessage: 'When should I take the medication?', time: 'Yesterday', online: false },
    { id: 3, name: 'Michael Brown', lastMessage: 'I’m feeling much better now', time: '2 days ago', online: false },
    { id: 4, name: 'Emily Davis', lastMessage: 'Can we schedule a follow-up?', time: '3 days ago', online: false },
    { id: 5, name: 'Robert Wilson', lastMessage: 'Thanks for the quick response', time: '4 days ago', online: false },
    { id: 6, name: 'Jennifer Martinez', lastMessage: 'See you at the appointment', time: '5 days ago', online: true },
  ];

  selectedConversation = this.conversations[0];

  messages: Message[] = [
    { text: "Hello Doctor, I've been experiencing some discomfort", time: "9:00 AM", isDoctor: false },
    { text: "I understand. Can you describe the symptoms in detail?", time: "9:15 AM", isDoctor: true },
    { text: "It's a mild pain in my lower back that comes and goes", time: "9:20 AM", isDoctor: false },
    { text: "I see. Have you been doing any heavy lifting or unusual activities recently?", time: "9:25 AM", isDoctor: true },
    { text: "Yes, I moved some furniture last weekend", time: "9:26 AM", isDoctor: false },
    { text: "That could be the cause. I'll prescribe some pain relief medication. Please rest and avoid heavy lifting for a week.", time: "10:00 AM", isDoctor: true },
    { text: "Thank you for the prescription", time: "10:30 AM", isDoctor: false },
  ];
   

  // Message input properties
  messageText: string = '';
  attachedFile: File | null = null;
  searchQuery: string = '';
  isTyping: boolean = false;
  private shouldScrollToBottom: boolean = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Select conversation
  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    // Clear unread badge
    conversation.unread = 0;
    // TODO: Load messages for this conversation from API
    console.log('Selected conversation:', conversation.name);
  }

  // Trigger file input click
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files.');
        return;
      }

      this.attachedFile = file;
      console.log('File attached:', file.name);
    }
  }

  // Remove attached file
  removeAttachment(): void {
    this.attachedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Handle Enter key press
  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Send message
  sendMessage(): void {
    if (!this.messageText.trim() && !this.attachedFile) {
      return;
    }

    // Get current time
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    // Create new message object
    const newMessage: Message = {
      text: this.messageText.trim(),
      time: time,
      isDoctor: true,
      hasAttachment: !!this.attachedFile,
      attachmentName: this.attachedFile?.name
    };

    // Add message to messages array
    this.messages.push(newMessage);

    // TODO: Send message to API
    console.log('Sending message:', newMessage);
    if (this.attachedFile) {
      console.log('With attachment:', this.attachedFile.name);
    }

    // Update last message in conversation
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = this.messageText.trim() || `Sent ${this.attachedFile?.name}`;
      this.selectedConversation.time = time;
    }

    // Clear input and attachment
    this.messageText = '';
    this.attachedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // Scroll to bottom
    this.shouldScrollToBottom = true;

    // Simulate patient typing response (for demo purposes)
    this.simulatePatientResponse();
  }

  // Simulate patient typing and response (demo only)
  private simulatePatientResponse(): void {
    // Show typing indicator after 1 second
    setTimeout(() => {
      this.isTyping = true;
      this.shouldScrollToBottom = true;

      // Send patient response after 2 more seconds
      setTimeout(() => {
        this.isTyping = false;
        
        const responses = [
          "Thank you, Doctor!",
          "I appreciate your help.",
          "That makes sense, I'll do that.",
          "Got it, thanks for the advice.",
          "I'll follow your instructions."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });

        const responseMessage: Message = {
          text: randomResponse,
          time: time,
          isDoctor: false
        };

        this.messages.push(responseMessage);
        
        // Update conversation
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = randomResponse;
          this.selectedConversation.time = time;
        }

        this.shouldScrollToBottom = true;
      }, 2000);
    }, 1000);
  }

  // Scroll to bottom of messages area
  private scrollToBottom(): void {
    try {
      if (this.messagesArea) {
        const element = this.messagesArea.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }


}
