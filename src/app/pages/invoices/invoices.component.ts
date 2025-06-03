import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Invoice, InvoiceStatus } from '../../models/invoices.model';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatTabsModule],
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  showCreateForm = false;
  createForm: Partial<Invoice> = {
    object: '',
    status: InvoiceStatus.Brouillon,
    adminNote: '',
    customerId: 0,
    discountName: '',
    discountValue: 0,
    productId: undefined,
    creationDate: new Date(),
    validityDate: new Date(),
  };
  editMode = false;
  editInvoiceId: number | null = null;
  viewInvoiceData: Invoice | null = null;
  showViewForm = false;
  selectedTab: string = 'informations';
  invoiceStatuses = Object.values(InvoiceStatus);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
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

  openCreateForm() {
    this.closeViewForm();
    this.showCreateForm = true;
    this.editMode = false;
    this.editInvoiceId = null;
    this.createForm = {
      object: '',
      status: InvoiceStatus.Brouillon,
      adminNote: '',
      customerId: 0,
      discountName: '',
      discountValue: 0,
      productId: undefined,
      creationDate: new Date(),
      validityDate: new Date(),
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.editInvoiceId = null;
  }

  createInvoice() {
    this.apiService.createInvoice(this.createForm).subscribe({
      next: () => {
        this.closeCreateForm();
        this.loadInvoices();
      }
    });
  }

  openEditForm(invoice: Invoice) {
    this.closeViewForm();
    this.editMode = true;
    this.showCreateForm = true;
    this.editInvoiceId = invoice.id;
    this.createForm = { ...invoice };
  }

  submitForm() {
    if (this.editMode && this.editInvoiceId) {
      this.apiService.updateInvoice(this.editInvoiceId, this.createForm).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
        }
      });
    } else {
      this.apiService.createInvoice(this.createForm).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
        }
      });
    }
  }

  viewInvoice(invoice: Invoice) {
    this.closeCreateForm();
    this.apiService.getInvoice(invoice.id).subscribe({
      next: (data) => {
        this.viewInvoiceData = data;
        this.showViewForm = true;
      }
    });
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewInvoiceData = null;
  }

  deleteInvoice(id: number | undefined) {
    if (!id) return;
    this.apiService.deleteInvoice(id).subscribe({
      next: () => {
        this.closeViewForm();
        this.loadInvoices();
      }
    });
  }
}
