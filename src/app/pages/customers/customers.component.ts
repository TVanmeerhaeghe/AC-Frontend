import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/customers.model';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute // <-- Ajouté
  ) {}

  ngOnInit(): void {
    this.loadCustomers();

    // Ouvre le formulaire de création si ?create=1 dans l'URL
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
      }
    });
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
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}
