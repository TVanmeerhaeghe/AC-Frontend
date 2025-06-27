import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/customers.model';
import { Invoice } from '../../models/invoices.model';
import { Estimate } from '../../models/estimates.model';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatTabsModule, ConfirmPopupComponent],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  showCreateForm = false;
  createForm: Partial<Customer> = {
    name: '',
    surname: '',
    email: '',
    phone: '',
    adress: '',
    postal_code: '',
    city: '',
    company: ''
  };
  editMode = false;
  editCustomerId: number | null = null;
  viewCustomerData: Customer | null = null;
  showViewForm = false;
  selectedTab: string = 'informations';
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  invoiceSearch: string = '';
  estimates: Estimate[] = [];
  filteredEstimates: Estimate[] = [];
  estimateSearch: string = '';
  purchases: { name: string; quantity: number; invoiceId: number }[] = [];
  filteredPurchases: { name: string; quantity: number; invoiceId: number }[] = [];
  purchaseSearch: string = '';

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.route.queryParams.subscribe(params => {
      if (params['create'] === '1') {
        this.openCreateForm();
      }
    });
  }

  loadCustomers() {
    this.loading = true;
    this.apiService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
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
    this.editCustomerId = null;
    this.createForm = {
      name: '',
      surname: '',
      email: '',
      phone: '',
      adress: '',
      postal_code: '',
      city: '',
      company: ''
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.editCustomerId = null;
  }

  createCustomer() {
    this.apiService.createCustomer(this.createForm).subscribe({
      next: () => {
        this.closeCreateForm();
        this.loadCustomers();
      }
    });
  }

  openEditForm(customer: Customer) {
    this.closeViewForm();
    this.editMode = true;
    this.showCreateForm = true;
    this.editCustomerId = customer.id;
    this.createForm = {
      name: customer.name,
      surname: customer.surname,
      email: customer.email,
      phone: customer.phone,
      adress: customer.adress,
      postal_code: customer.postal_code,
      city: customer.city,
      company: customer.company
    };
  }

  submitForm() {
    if (this.editMode && this.editCustomerId) {
      this.apiService.updateCustomer(this.editCustomerId, this.createForm).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadCustomers();
          this.snackBar.open('Client modifié avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification du client', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.apiService.createCustomer(this.createForm).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadCustomers();
          this.snackBar.open('Client créé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  viewCustomer(customer: Customer) {
    this.closeCreateForm();
    this.apiService.getCustomer(customer.id).subscribe({
      next: (data) => {
        this.viewCustomerData = data;
        this.showViewForm = true;
        this.loadInvoicesForCustomer(data.id);
        this.loadEstimatesForCustomer(data.id);
        this.loadPurchasesForCustomer(data.id);
      }
    });
  }

  loadInvoicesForCustomer(customerId: number) {
    this.apiService.getAllInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        this.invoices = invoices.filter(inv => inv.customer_id === customerId);
        this.filteredInvoices = this.invoices;
      }
    });
  }

  filterInvoices() {
    const search = this.invoiceSearch.toLowerCase();
    this.filteredInvoices = this.invoices.filter(inv =>
      (`Facture#${inv.id}`.toLowerCase().includes(search) ||
        (inv.object && inv.object.toLowerCase().includes(search)))
    );
  }

  loadEstimatesForCustomer(customerId: number) {
    this.apiService.getAllEstimates().subscribe({
      next: (estimates: Estimate[]) => {
        this.estimates = estimates.filter(e =>
          // @ts-ignore
          (e.customerId === customerId) || (e['customer_id'] === customerId)
        );
        this.filteredEstimates = this.estimates;
      }
    });
  }

  filterEstimates() {
    const search = this.estimateSearch.toLowerCase();
    this.filteredEstimates = this.estimates.filter(e =>
      (`Devis#${e.id}`.toLowerCase().includes(search) ||
        (e.object && e.object.toLowerCase().includes(search)))
    );
  }

  loadPurchasesForCustomer(customerId: number) {
    this.apiService.getAllInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        const clientInvoices = invoices.filter(inv => inv.customer_id === customerId);
        if (clientInvoices.length === 0) {
          this.purchases = [];
          this.filteredPurchases = [];
          return;
        }
        // Appel pour chaque facture pour récupérer les produits
        const invoiceDetailCalls = clientInvoices.map(inv => this.apiService.getInvoice(inv.id!));
        forkJoin(invoiceDetailCalls).subscribe({
          next: (detailedInvoices: any[]) => {
            const purchases: { name: string; quantity: number; invoiceId: number }[] = [];
            detailedInvoices.forEach(inv => {
              if (inv.products && Array.isArray(inv.products)) {
                interface InvoiceProduct {
                  quantity: number;
                }

                interface Product {
                  name: string;
                  quantity?: number;
                  InvoiceProduct?: InvoiceProduct;
                }

                interface DetailedInvoice {
                  id?: number;
                  products?: Product[];
                }

                (inv.products as Product[]).forEach((prod: Product) => {
                  let qty: number | undefined = prod.quantity;
                  if (prod.InvoiceProduct && typeof prod.InvoiceProduct.quantity === 'number') {
                    qty = prod.InvoiceProduct.quantity;
                  }
                  if (prod && prod.name && qty != null) {
                    purchases.push({
                      name: prod.name,
                      quantity: qty,
                      invoiceId: (inv as DetailedInvoice).id ?? 0
                    });
                  } else {
                    console.warn('[loadPurchasesForCustomer] Produit sans nom ou quantité:', prod);
                  }
                });
              } else {
                console.warn('[loadPurchasesForCustomer] Invoice sans produits:', inv);
              }
            });
            console.log('[loadPurchasesForCustomer] Purchases:', purchases);
            this.purchases = purchases;
            this.filteredPurchases = this.purchases;
          },
          error: (err) => {
            console.error('[loadPurchasesForCustomer] Error in forkJoin:', err);
            this.purchases = [];
            this.filteredPurchases = [];
          }
        });
      },
      error: (err) => {
        console.error('[loadPurchasesForCustomer] Error:', err);
        this.purchases = [];
        this.filteredPurchases = [];
      }
    });
  }

  filterPurchases() {
    const search = this.purchaseSearch.toLowerCase();
    this.filteredPurchases = this.purchases.filter(p =>
      p.name.toLowerCase().includes(search)
      || (`Achat#${p.invoiceId}`).toLowerCase().includes(search)
      || (`Facture#${p.invoiceId}`).toLowerCase().includes(search)
    );
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewCustomerData = null;
  }

  askDeleteCustomer(customer: Customer | null) {
    if (!customer?.id) return;
    this.confirmTitle = `Supprimer le client <span class="popup-highlight">${customer.name} ${customer.surname}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.apiService.deleteCustomer(customer.id!).subscribe({
        next: () => {
          this.closeViewForm();
          this.loadCustomers();
          this.snackBar.open('Client supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
        }
      });
    };
    this.showConfirm = true;
  }

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    (this.showConfirm ??= false);
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}

