import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './step3.html',
  styleUrl: './step3.css',
})
export class Step3 {
   bio = '';
}
