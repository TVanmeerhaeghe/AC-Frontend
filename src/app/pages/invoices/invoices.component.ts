import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Invoice, InvoiceStatus, InvoiceProductInput } from '../../models/invoices.model';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Customer } from '../../models/customers.model';
import { Product } from '../../models/products.model';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ConfirmPopupComponent
  ],
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  customers: Customer[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  showCreateForm = false;
  createForm: Partial<Invoice> & { products: InvoiceProductInput[] } = {
    object: '',
    status: InvoiceStatus.Brouillon,
    admin_note: '',
    customer_id: null,
    discount_name: '',
    discount_value: 0,
    products: [],
    creation_date: new Date().toISOString().substring(0, 10),
    validity_date: new Date().toISOString().substring(0, 10),
  };
  editMode = false;
  editInvoiceId: number | null = null;
  viewInvoiceData: Invoice | null = null;
  showViewForm = false;
  selectedTab: string = 'informations';
  invoiceStatuses = Object.values(InvoiceStatus);
  searchQuery: string = '';

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCustomers();
    this.loadProducts();
  }

  loadInvoices() {
    this.loading = true;
    this.apiService.getAllInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCustomers() {
    this.apiService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: () => {
        console.error('Erreur lors du chargement des clients');
      }
    });
  }

  loadProducts() {
    this.apiService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: () => {
        console.error('Erreur lors du chargement des produits');
      }
    });
  }

  openCreateForm() {
    this.closeViewForm();
    this.showCreateForm = true;
    this.editMode = false;
    this.editInvoiceId = null;
    const maxId = this.invoices.length > 0 ? Math.max(...this.invoices.map(invoice => invoice.id ?? 0)) : 0;
    const nextId = maxId + 1;
    this.createForm = {
      object: '',
      status: InvoiceStatus.Brouillon,
      admin_note: '',
      customer_id: null,
      discount_name: '',
      discount_value: 0,
      products: [{ product_id: null as any, quantity: 1 }],
      creation_date: new Date().toISOString().substring(0, 10),
      validity_date: new Date().toISOString().substring(0, 10),
      id: nextId,
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.editInvoiceId = null;
  }

  openEditForm(invoice: Invoice) {
    this.closeViewForm();
    this.editMode = true;
    this.showCreateForm = true;
    this.editInvoiceId = invoice.id ?? null;
    this.createForm = {
      ...invoice,
      products: invoice.products
        ? invoice.products.map(p => ({ product_id: p.product_id, quantity: p.quantity }))
        : [{ product_id: null as any, quantity: 1 }],
    };
  }

  addProductToForm() {
    this.createForm.products.push({ product_id: null as any, quantity: 1 });
  }

  removeProductFromForm(index: number) {
    this.createForm.products.splice(index, 1);
  }

  submitForm() {
    const filteredProducts = this.createForm.products.filter(
      p => p.product_id && p.quantity && p.quantity > 0
    );
    const formToSubmit = {
      ...this.createForm,
      creation_date: this.createForm.creation_date
        ? new Date(this.createForm.creation_date).toISOString().substring(0, 10)
        : '',
      validity_date: this.createForm.validity_date
        ? new Date(this.createForm.validity_date).toISOString().substring(0, 10)
        : '',
      products: filteredProducts,
    };

    console.log('POST invoice:', formToSubmit);

    if (this.editMode && this.editInvoiceId) {
      this.apiService.updateInvoice(this.editInvoiceId, formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
        }
      });
    } else {
      this.apiService.createInvoice(formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
        }
      });
    }
  }

  viewInvoice(invoice: Invoice) {
    this.closeCreateForm();
    this.apiService.getInvoice(invoice.id!).subscribe({
      next: (data) => {
        this.viewInvoiceData = data;
        this.showViewForm = true;
      },
      error: () => {
        console.error('Erreur lors de la récupération de la facture');
      }
    });
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewInvoiceData = null;
  }

  askDeleteInvoice(invoice: Invoice | null) {
    if (!invoice?.id) return;
    this.confirmTitle = `Supprimer la <span class="popup-highlight">facture#${invoice.id}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.apiService.deleteInvoice(invoice.id!).subscribe({
        next: () => {
          this.closeViewForm();
          this.loadInvoices();
        }
      });
    };
    this.showConfirm = true;
  }

  getCustomerFullName(customer_id: number): string {
    const customer = this.customers.find(c => c.id === customer_id);
    return customer ? `${customer.surname} ${customer.name}` : 'Client non renseigné';
  }

  getProductName(product_id: number): string {
    const product = this.products.find(p => p.id === product_id);
    return product ? product.name : 'Produit non renseigné';
  }

  onSearchQueryChange() {
    if (this.products) {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}
