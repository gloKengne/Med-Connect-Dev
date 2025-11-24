import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

interface MedicalDocument {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  fileSize: string;
}

@Component({
  selector: 'app-records',
  imports: [],
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class Records implements OnInit{

   searchQuery: string = '';
  selectedCategory: string = 'all';
  
  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lab', label: 'Lab Results', color: '#4A90E2' },
    { value: 'imaging', label: 'Imaging', color: '#5FB3B3' },
    { value: 'prescription', label: 'Prescription', color: '#FFA07A' },
    { value: 'clinical', label: 'Clinical Notes', color: '#9B59B6' }
  ];

  documents: MedicalDocument[] = [
    {
      id: '1',
      title: 'Complete Blood Count Results',
      category: 'Lab Results',
      categoryColor: '#4A90E2',
      date: 'Nov 8, 2025',
      fileSize: '245 KB'
    },
    {
      id: '2',
      title: 'Chest X-Ray - Frontal View',
      category: 'Imaging',
      categoryColor: '#5FB3B3',
      date: 'Nov 5, 2025',
      fileSize: '1.2 MB'
    },
    {
      id: '3',
      title: 'Amoxicillin 500mg Prescription',
      category: 'Prescription',
      categoryColor: '#FFA07A',
      date: 'Nov 3, 2025',
      fileSize: '180 KB'
    }
  ];

  filteredDocuments: MedicalDocument[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredDocuments = [...this.documents];
  }

  onSearch(): void {
    this.filterDocuments();
  }

  onCategoryChange(): void {
    this.filterDocuments();
  }

  filterDocuments(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || 
                             doc.category.toLowerCase().includes(this.selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }

  uploadDocument(): void {
    this.router.navigate(['/records/upload']);
  }

  viewDocument(docId: string): void {
    this.router.navigate(['/records', docId]);
  }

  getCategoryColor(category: string): string {
    const cat = this.categories.find(c => 
      category.toLowerCase().includes(c.value)
    );
    return cat?.color || '#666';
  }

}
