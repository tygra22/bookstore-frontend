import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

import { Book } from '../../../../models/book.model';

@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './book-form-dialog.component.html',
  styleUrls: ['./book-form-dialog.component.scss']
})
export class BookFormDialogComponent implements OnInit {
  bookForm!: FormGroup;
  formTitle = 'Add New Book';
  submitButtonText = 'Add Book';
  isEditMode = false;
  
  // Common genres for the dropdown
  commonGenres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Thriller',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Children',
    'Young Adult',
    'Poetry',
    'Comic/Graphic Novel'
  ];
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BookFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Book>
  ) {}
  
  ngOnInit(): void {
    this.isEditMode = !!this.data._id;
    
    if (this.isEditMode) {
      this.formTitle = 'Edit Book';
      this.submitButtonText = 'Update Book';
    }
    
    this.initForm();
  }
  
  initForm(): void {
    // Create the form with validators
    this.bookForm = this.fb.group({
      title: [this.data.title || '', [Validators.required, Validators.maxLength(100)]],
      author: [this.data.author || '', [Validators.required, Validators.maxLength(100)]],
      isbn: [this.data.isbn || '', [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)]],
      genre: [this.data.genre || '', Validators.required],
      price: [this.data.price || 0, [Validators.required, Validators.min(0)]],
      quantity: [this.data.quantity || 0, [Validators.required, Validators.min(0)]],
      description: [this.data.description || ''],
      publisher: [this.data.publisher || ''],
      publishDate: [this.data.publishDate ? new Date(this.data.publishDate) : null],
      imageUrl: [this.data.imageUrl || ''],
      isUpcoming: [this.data.isUpcoming || false]
    });
  }
  
  onSubmit(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      
      // Prepare the book data, including the _id if in edit mode
      const bookData: Partial<Book> = {
        ...formValue
      };
      
      if (this.isEditMode && this.data._id) {
        bookData._id = this.data._id;
      }
      
      this.dialogRef.close(bookData);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.bookForm.markAllAsTouched();
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  // Helper for error messages
  getErrorMessage(controlName: string): string {
    const control = this.bookForm.get(controlName);
    
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'This field is required';
    }
    
    if (control.hasError('min')) {
      return 'Must be a positive number';
    }
    
    if (control.hasError('maxlength')) {
      return 'Text is too long';
    }
    
    if (control.hasError('pattern')) {
      return 'Invalid format';
    }
    
    return '';
  }
}
