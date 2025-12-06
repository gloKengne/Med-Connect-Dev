import { Component , EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step1.html',
  styleUrl: './step1.css',
})
export class Step1 {

  specialty = '';
  phone = '+1 (555) 123-4567';
  hospital = 'City General Hospital';
  experience = 10;
  fee = 150;

  
  // Emit events to parent component
  @Output() stepClosed = new EventEmitter<void>();
  @Output() stepNext = new EventEmitter<void>();

  // Method to close the modal
  close() {
    console.log('Modal closed');
    this.stepClosed.emit(); // notify parent to close
  }

  // Method to go to the next step
  next() {
    if (!this.specialty || !this.phone) {
      alert('Please fill in the required fields!');
      return;
    }
    console.log('Moving to next step');
    this.stepNext.emit(); // notify parent to show next step
  }

}
