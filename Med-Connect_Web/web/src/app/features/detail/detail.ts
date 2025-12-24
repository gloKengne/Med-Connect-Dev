import { CommonModule } from '@angular/common';
import { Component , OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedHeader } from '../shared-header/shared-header';

interface DocumentDetail {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  fileSize: string;
  uploadedDate: string;
  fileUrl: string;
  fileType: string;
  description?: string;
}

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, SharedHeader],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit{

  documentId: string = '';
  document: DocumentDetail | null = null;
  loading: boolean = true;
  showDeleteConfirm: boolean = false;

  // Mock data - Replace with actual API call
  mockDocuments: DocumentDetail[] = [
    {
      id: '1',
      title: 'Complete Blood Count Results',
      category: 'Lab Results',
      categoryColor: '#4A90E2',
      date: 'Nov 8, 2025',
      uploadedDate: 'Nov 9, 2025',
      fileSize: '245 KB',
      fileUrl: '/assets/documents/sample.pdf',
      fileType: 'application/pdf',
      description: 'Annual routine blood work results showing all values within normal range.'
    },
    {
      id: '2',
      title: 'Chest X-Ray - Frontal View',
      category: 'Imaging',
      categoryColor: '#5FB3B3',
      date: 'Nov 5, 2025',
      uploadedDate: 'Nov 6, 2025',
      fileSize: '1.2 MB',
      fileUrl: '/assets/documents/xray.jpg',
      fileType: 'image/jpeg',
      description: 'Chest X-ray ordered due to persistent cough. Results show clear lungs.'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDocument();
  }

  loadDocument(): void {
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.document = this.mockDocuments.find(d => d.id === this.documentId) || null;
      this.loading = false;
    }, 500);
  }

  downloadDocument(): void {
    if (this.document) {
      console.log('Downloading:', this.document.title);
      // TODO: Implement actual download logic
      window.open(this.document.fileUrl, '_blank');
    }
  }

  shareDocument(): void {
    console.log('Share document:', this.documentId);
    // TODO: Implement share functionality
  }

  deleteDocument(): void {
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    // TODO: Implement actual delete API call
    console.log('Deleting document:', this.documentId);
    this.router.navigate(['medical-records']);
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  goBack(): void {
    this.router.navigate(['medical-records']);
  }

  logout(): void {
    this.router.navigate(['login']);
  }

}
