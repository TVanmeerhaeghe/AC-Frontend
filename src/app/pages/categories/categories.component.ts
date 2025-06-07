import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/categories.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule, 
    MatInputModule,
    ConfirmPopupComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;

  showCreateForm = false;
  showViewForm = false;
  editMode = false;

  categoryForm: Partial<Category> = {};
  viewCategoryData: Category | null = null;

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading = true;
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.categories = [];
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.editMode = false;
    this.categoryForm = {};
    this.showCreateForm = true;
    this.showViewForm = false;
  }

  openEditForm(category: Category) {
    this.editMode = true;
    this.categoryForm = { ...category };
    this.showCreateForm = true;
    this.showViewForm = false;
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.categoryForm = {};
  }

  submitForm() {
    if (this.editMode && this.categoryForm.id) {
      if (this.categoryForm.name && this.categoryForm.description) {
        this.apiService.updateCategory(
          this.categoryForm.id,
          {
            name: this.categoryForm.name,
            description: this.categoryForm.description,
            icon: this.categoryForm.icon ?? ''
          }
        ).subscribe(() => {
          this.fetchCategories();
          this.closeCreateForm();
        });
      }
    } else {
      this.apiService.createCategory(this.categoryForm).subscribe(() => {
        this.fetchCategories();
        this.closeCreateForm();
      });
    }
  }

  openViewForm(category: Category) {
    this.viewCategoryData = category;
    this.showViewForm = true;
    this.showCreateForm = false;
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewCategoryData = null;
  }

  askDeleteCategory(category: Category | null) {
    if (!category?.id) return;
    this.confirmTitle = `Supprimer la catégorie <span class="popup-highlight">${category.name}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.apiService.deleteCategory(category.id!).subscribe(() => {
        this.fetchCategories();
        this.closeViewForm();
      });
    };
    this.showConfirm = true;
  }

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}
