import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Invoice, InvoiceStatus, InvoiceProduct } from '../../models/invoices.model';
import { Customer } from '../../models/customers.model';
import { Product } from '../../models/products.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { Task } from '../../models/tasks.model';
import { lastValueFrom } from 'rxjs';

interface InvoiceProductInput {
  product_id: number;
  quantity: number;
}

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
    ConfirmPopupComponent,
    MatRadioModule,
    MatChipsModule
  ],
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  customers: Customer[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  showCreateForm = false;
  createForm: Omit<Partial<Invoice>, 'products'> & { products: InvoiceProductInput[] } = {
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
  invoiceStatuses = Object.values(InvoiceStatus);
  searchQuery: string = '';
  invoiceType: 'achat' | 'prestation' = 'achat';
  prestationTasks: Partial<Task>[] = [];
  tvaValues: string[] = [];

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCustomers();
    this.loadProducts();
    this.apiService.getTvaValues().subscribe({
      next: (values) => { this.tvaValues = values; },
      error: () => { this.tvaValues = ['20.00', '21.20']; }
    });

    this.route.queryParams.subscribe(params => {
      if (params['create'] === '1') {
        this.openCreateForm();
      }
    });
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
    this.invoiceType = 'achat';
    this.prestationTasks = [];
    const maxId = this.invoices.length > 0 ? Math.max(...this.invoices.map(invoice => invoice.id ?? 0)) : 0;
    const nextId = maxId + 1;
    this.createForm = {
      object: '',
      status: InvoiceStatus.Brouillon,
      admin_note: '',
      customer_id: null,
      discount_name: '',
      discount_value: 0,
      products: [],
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
        ? invoice.products.map(p => ({
            product_id: p.id,
            quantity: (p as any).InvoiceProduct?.quantity ?? (p as any).quantity ?? 1
          }))
        : [],
    };
    this.invoiceType = invoice.products && invoice.products.length > 0 ? 'achat' : 'prestation';
    this.prestationTasks = [];
    if (this.invoiceType === 'prestation' && invoice.id) {
      this.apiService.getAllTasks().subscribe(tasks => {
        this.prestationTasks = tasks.filter(t => t.invoice_id === invoice.id);
      });
    }
  }

  addProductToForm() {
    this.createForm.products = [
      ...this.createForm.products,
      { product_id: -1, quantity: 1 }
    ];
  }

  removeProductFromForm(index: number) {
    this.createForm.products = this.createForm.products.filter((_, i) => i !== index);
  }

  addPrestationTask() {
    this.prestationTasks.push({
      name: '',
      description: '',
      hours: 1,
      tva: this.tvaValues[0] || '20.00',
      hourly_rate: 0
    });
  }

  removePrestationTask(index: number) {
    this.prestationTasks.splice(index, 1);
  }

  submitForm() {
    const filteredProducts = (this.createForm.products || [])
      .filter(p => p.product_id !== -1 && p.quantity && p.quantity > 0)
      .map(p => ({
        product_id: Number(p.product_id),
        quantity: Number(p.quantity)
      }));
    const formToSubmit: any = {
      creation_date: this.createForm.creation_date
        ? new Date(this.createForm.creation_date).toISOString().substring(0, 10)
        : '',
      validity_date: this.createForm.validity_date
        ? new Date(this.createForm.validity_date).toISOString().substring(0, 10)
        : '',
      object: this.createForm.object,
      status: this.createForm.status,
      admin_note: this.createForm.admin_note,
      customer_id: this.createForm.customer_id,
      discount_name: this.createForm.discount_name,
      discount_value: this.createForm.discount_value,
      products: filteredProducts
    };

    if (this.invoiceType === 'prestation') {
      const formToSubmit: any = {
        ...this.createForm,
        products: [],
      };
      if (this.editMode && this.editInvoiceId) {
        this.apiService.updateInvoice(this.editInvoiceId, formToSubmit).subscribe({
          next: async (invoice) => {
            const invoiceId = invoice?.id ?? this.editInvoiceId;
            const saveTasks$ = this.prestationTasks.map(task => {
              if (task.id) {
                return lastValueFrom(this.apiService.updateTask(task.id, { ...task, invoice_id: invoiceId }));
              } else {
                return lastValueFrom(this.apiService.createTask({ ...task, invoice_id: invoiceId }));
              }
            });
            await Promise.all(saveTasks$);
            this.closeCreateForm();
            this.loadInvoices();
            this.snackBar.open('Facture modifiée avec succès', 'Fermer', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Erreur lors de la modification de la facture', 'Fermer', { duration: 3000 });
          }
        });
      } else {
        this.apiService.createInvoice(formToSubmit).subscribe({
          next: async (invoice) => {
            console.log('Invoice response:', invoice);
            const invoiceId =
              invoice?.id ??
              invoice?.data?.id ??
              invoice?.invoice?.id ??
              invoice?.invoice_id ??
              invoice?.[0]?.id;
            if (!invoiceId) {
              this.snackBar.open('Erreur : id de facture introuvable', 'Fermer', { duration: 3000 });
              return;
            }
            const saveTasks$ = this.prestationTasks.map(task =>
              lastValueFrom(this.apiService.createTask({ ...task, invoice_id: invoiceId }))
            );
            await Promise.all(saveTasks$);
            this.closeCreateForm();
            this.loadInvoices();
            this.snackBar.open('Facture et tâches créées avec succès', 'Fermer', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Erreur lors de la création de la facture', 'Fermer', { duration: 3000 });
          }
        });
      }
      return;
    }

    if (this.editMode && this.editInvoiceId) {
      this.apiService.updateInvoice(this.editInvoiceId, formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
          this.snackBar.open('Facture modifiée avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification de la facture', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.apiService.createInvoice(formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadInvoices();
          this.snackBar.open('Facture créée avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création de la facture', 'Fermer', { duration: 3000 });
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
        if (!data.products || data.products.length === 0) {
          this.apiService.getAllTasks().subscribe(tasks => {
            this.prestationTasks = tasks.filter(t => t.invoice_id === data.id);
          });
        } else {
          this.prestationTasks = [];
        }
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
          this.snackBar.open('Facture supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression de la facture', 'Fermer', { duration: 3000 });
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

  getCustomerAddress(customer_id: number | null | undefined): string {
    if (!customer_id) return '';
    const customer = this.customers.find(c => c.id === customer_id);
    return customer?.adress ?? 'Adresse non renseignée';
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

  getCustomerField(customer_id: number, field: string): string {
    const customer = this.customers.find(c => c.id === customer_id);
    return customer && customer[field as keyof Customer] ? String(customer[field as keyof Customer]) : '';
  }

  isProductInForm(productId: number): boolean {
    return this.createForm.products.some(p => p.product_id === productId);
  }

  addOrIncrementProduct(product: Product) {
    const existing = this.createForm.products.find(p => p.product_id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.createForm.products.push({ product_id: product.id, quantity: 1 });
    }
    this.searchQuery = '';
    this.filteredProducts = this.products;
  }

  incrementProduct(index: number) {
    this.createForm.products[index].quantity++;
  }

  decrementProduct(index: number) {
    this.createForm.products[index].quantity--;
    if (this.createForm.products[index].quantity <= 0) {
      this.createForm.products.splice(index, 1);
    }
  }

  get prestationTotalHT(): number {
    return this.prestationTasks.reduce((sum, task) =>
      sum + ((task.hours ?? 0) * (task.hourly_rate ?? 0)), 0
    );
  }

  get prestationTotalTTC(): number {
    return this.prestationTasks.reduce((sum, task) => {
      const ht = (task.hours ?? 0) * (task.hourly_rate ?? 0);
      const tva = parseFloat(task.tva ?? '0');
      return sum + ht * (1 + (tva / 100));
    }, 0);
  }

  get produitsTotalTTC(): number {
    if (!this.viewInvoiceData?.products) return 0;
    return this.viewInvoiceData.products.reduce((sum, prod) =>
      sum + ((prod.price ?? 0) * ((prod.InvoiceProduct?.quantity ?? prod.quantity ?? 1))), 0
    );
  }

  // Advenced TVA calc
  get prestationTVADetails(): { tva: string, montant: number }[] {
    const tvaMap = new Map<string, number>();
    for (const task of this.prestationTasks) {
      const ht = (task.hours ?? 0) * (task.hourly_rate ?? 0);
      const tva = task.tva ?? '0';
      const tvaRate = parseFloat(tva);
      if (!tvaMap.has(tva)) tvaMap.set(tva, 0);
      tvaMap.set(tva, tvaMap.get(tva)! + ht * (tvaRate / 100));
    }

    return Array.from(tvaMap.entries())
      .filter(([tva, montant]) => parseFloat(tva) > 0 && montant > 0)
      .map(([tva, montant]) => ({ tva, montant }));
  }

  isLastTaskValid(): boolean {
    if (this.prestationTasks.length === 0) return true;
    const last = this.prestationTasks[this.prestationTasks.length - 1];
    if (!last) return false;
    if (!last.name || last.name.trim() === '') return false;
    if (!last.hours || last.hours <= 0) return false;
    if (!last.hourly_rate || last.hourly_rate <= 0) return false;
    return true;
  }
}
