import { CommonModule } from '@angular/common';
import { Component , OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedHeader } from '../shared-header/shared-header';

@Component({
  selector: 'app-upload-doc',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedHeader],
  templateUrl: './upload-doc.html',
  styleUrl: './upload-doc.css',
})
export class UploadDoc implements OnInit {
uploadForm: FormGroup;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  uploading: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string = '';

  categories = [
    { value: '', label: 'Select Category', disabled: true },
    { value: 'lab', label: 'Lab Results', color: '#4A90E2' },
    { value: 'imaging', label: 'Imaging (X-Ray, MRI, CT)', color: '#5FB3B3' },
    { value: 'prescription', label: 'Prescription', color: '#FFA07A' },
    { value: 'clinical', label: 'Clinical Notes', color: '#9B59B6' },
    { value: 'vaccination', label: 'Vaccination Record', color: '#28A745' },
    { value: 'other', label: 'Other', color: '#6C757D' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.uploadForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      documentDate: ['', Validators.required],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {}

  get title() {
    return this.uploadForm.get('title');
  }

  get category() {
    return this.uploadForm.get('category');
  }

  get documentDate() {
    return this.uploadForm.get('documentDate');
  }

  get description() {
    return this.uploadForm.get('description');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  validateAndSetFile(file: File): void {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Please upload PDF, JPG, or PNG files only.';
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.errorMessage = 'File size exceeds 10MB limit. Please choose a smaller file.';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }

    // Auto-fill title if empty
    if (!this.uploadForm.get('title')?.value) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      this.uploadForm.patchValue({ title: fileName });
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploading = true;
      this.uploadProgress = 0;

      // Simulate upload progress
      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.uploading = false;
            // TODO: Implement actual upload to server
            console.log('Form Data:', this.uploadForm.value);
            console.log('File:', this.selectedFile);
            this.router.navigate(['medical-records']);
          }, 500);
        }
      }, 200);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.uploadForm.controls).forEach(key => {
        this.uploadForm.get(key)?.markAsTouched();
      });

      if (!this.selectedFile) {
        this.errorMessage = 'Please select a file to upload.';
      }
    }
  }

  cancel(): void {
    this.router.navigate(['medical-records']);
  }

  logout(): void {
    this.router.navigate(['login']);
  }
}
