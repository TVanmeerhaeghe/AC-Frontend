import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Product, Condition } from '../../models/products.model';
import { Category } from '../../models/categories.model';
import { Customer } from '../../models/customers.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; 
import { MatOptionModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { slugify } from '../../services/slugify.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule, RouterModule]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  customers: Customer[] = [];
  loading = false;

  public slugify = slugify;

  showCreateForm = false;
  showViewForm = false;
  editMode = false;

  productForm: any = {};
  viewProductData: Product | null = null;
  selectedImages: File[] = [];
  selectedVideo: File | null = null;
  selectedImageTab: number = 0;
  buyerDetails: Customer | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchCustomers();
  }

  fetchProducts() {
    this.loading = true;
    this.apiService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  fetchCategories() {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map(cat => ({
          ...cat,
          slug: cat.slug || this.slugify(cat.name)
        }));
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  fetchCustomers() {
    this.apiService.getAllCustomers().subscribe({
      next: (data) => { this.customers = data; },
      error: () => { this.customers = []; }
    });
  }

  openCreateForm() {
    this.editMode = false;
    this.productForm = {};
    this.selectedImages = [];
    this.selectedVideo = null;
    this.showCreateForm = true;
    this.showViewForm = false;
  }

  openEditForm(product: Product) {
    this.editMode = true;
    this.productForm = {
      ...product,
      buy_by: product.buy_by ?? null,
      condition: product.condition,
      sellState: !!product.sell_state
    };
    this.selectedImages = [];
    this.selectedVideo = null;
    this.selectedImageTab = 0;
    this.showCreateForm = true;
    this.showViewForm = false;
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.productForm = {};
    this.selectedImages = [];
    this.selectedVideo = null;
  }

  openViewForm(product: Product) {
    this.viewProductData = { ...product };
    this.selectedImageTab = 0;
    this.buyerDetails = null;
    if (product.buy_by) {
      if (typeof product.buy_by === 'object') {
        this.buyerDetails = product.buy_by;
      } else {
        this.apiService.getCustomer(product.buy_by).subscribe({
          next: (customer) => this.buyerDetails = customer,
          error: () => this.buyerDetails = null
        });
      }
    }
    this.showViewForm = true;
    this.showCreateForm = false;
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewProductData = null;
  }

  deleteProduct(id: number | undefined) {
    if (!id) return;
    this.apiService.deleteProduct(id).subscribe({
      next: () => {
        this.fetchProducts();
        this.closeViewForm();
      }
    });
  }

  onImageChange(event: any) {
    const files = event.target.files;
    this.selectedImages = [];
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        this.selectedImages.push(files[i]);
      }
      this.selectedImageTab = 0;
    }
  }

  getImagePreview(file: File): string | ArrayBuffer | null {
    if (!file) return null;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setTimeout(() => {}, 0);
    };
    return reader.result;
  }

  onVideoChange(event: any) {
    const file = event.target.files && event.target.files[0];
    this.selectedVideo = file ? file : null;
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.productForm.name || '');
    formData.append('description', this.productForm.description || '');
    formData.append('category_id', this.productForm.category_id || '');
    formData.append('condition', this.productForm.condition || '');
    formData.append('price', this.productForm.price || '');
    formData.append('quantity', this.productForm.quantity || '');
    formData.append('material', this.productForm.material || '');
    formData.append('style', this.productForm.style || '');
    formData.append('sell_state', this.productForm.sellState ? '1' : '0');
    formData.append('buy_by', this.productForm.buy_by ? this.productForm.buy_by.toString() : '');

    if (this.selectedImages && this.selectedImages.length) {
      for (let i = 0; i < this.selectedImages.length; i++) {
        formData.append('images', this.selectedImages[i]);
      }
    }

    if (this.selectedVideo) {
      formData.append('video', this.selectedVideo);
    }

    if (this.editMode && this.productForm.id) {
      this.apiService.updateProduct(this.productForm.id, formData).subscribe(() => {
        this.fetchProducts();
        this.closeCreateForm();
      });
    } else {
      this.apiService.createProduct(formData).subscribe(() => {
        this.fetchProducts();
        this.closeCreateForm();
      });
    }
  }

  getCategoryName(id: number | undefined): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '';
  }

  getCustomerName(buy_by: number | null | undefined): string {
    if (!buy_by) return 'Sans acheteur';
    const customer = this.customers.find(c => c.id === buy_by);
    return customer ? `${customer.name} ${customer.surname}` : 'Sans acheteur';
  }

  getCategorySlug(product: Product): string {
    const cat = this.categories?.find(c => c.id === product.category_id);
    console.log('Produit:', product);
    console.log('Catégorie trouvée:', cat);
    return cat ? cat.slug : 'tous';
  }
}
