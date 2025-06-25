import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Estimate, EstimateStatus } from '../../models/estimates.model';
import { Customer } from '../../models/customers.model';
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

@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.component.html',
  styleUrl: './estimates.component.scss',
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
export class EstimatesComponent implements OnInit {
  estimates: Estimate[] = [];
  customers: Customer[] = [];
  loading = false;
  showCreateForm = false;
  createForm: Partial<Estimate> = {
    object: '',
    status: EstimateStatus.Brouillon,
    adminNote: '',
    customerId: undefined,
    discountName: '',
    discountValue: 0,
    creationDate: new Date(),
    validityDate: new Date(),
    finalNote: ''
  };
  editMode = false;
  editEstimateId: number | null = null;
  viewEstimateData: Estimate | null = null;
  showViewForm = false;
  estimateStatuses = Object.values(EstimateStatus);
  searchQuery: string = '';
  filteredEstimates: Estimate[] = [];

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
    this.loadEstimates();
    this.loadCustomers();

    this.route.queryParams.subscribe(params => {
      if (params['create'] === '1') {
        this.openCreateForm();
      }
    });
  }

  loadEstimates() {
    this.loading = true;
    this.apiService.getAllEstimates().subscribe({
      next: (data) => {
        this.estimates = data;
        this.filteredEstimates = data;
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

  openCreateForm() {
    this.closeViewForm();
    this.showCreateForm = true;
    this.editMode = false;
    this.editEstimateId = null;
    this.createForm = {
      object: '',
      status: EstimateStatus.Brouillon,
      adminNote: '',
      customerId: undefined,
      discountName: '',
      discountValue: 0,
      creationDate: new Date(),
      validityDate: new Date(),
      finalNote: ''
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.editMode = false;
    this.editEstimateId = null;
  }

  openEditForm(estimate: Estimate) {
    this.closeViewForm();
    this.editMode = true;
    this.showCreateForm = true;
    this.editEstimateId = estimate.id ?? null;
    this.createForm = { ...estimate };
  }

  submitForm() {
    const formToSubmit: any = {
      ...this.createForm,
      creationDate: this.createForm.creationDate ? new Date(this.createForm.creationDate).toISOString().substring(0, 10) : '',
      validityDate: this.createForm.validityDate ? new Date(this.createForm.validityDate).toISOString().substring(0, 10) : ''
    };

    if (this.editMode && this.editEstimateId) {
      this.apiService.updateEstimate(this.editEstimateId, formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadEstimates();
          this.snackBar.open('Devis modifié avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la modification du devis', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.apiService.createEstimate(formToSubmit).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadEstimates();
          this.snackBar.open('Devis créé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création du devis', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  viewEstimate(estimate: Estimate) {
    this.closeCreateForm();
    this.apiService.getEstimate(estimate.id!).subscribe({
      next: (data) => {
        this.viewEstimateData = data;
        this.showViewForm = true;
      },
      error: () => {
        console.error('Erreur lors de la récupération du devis');
      }
    });
  }

  closeViewForm() {
    this.showViewForm = false;
    this.viewEstimateData = null;
  }

  askDeleteEstimate(estimate: Estimate | null) {
    if (!estimate?.id) return;
    this.confirmTitle = `Supprimer le <span class="popup-highlight">devis#${estimate.id}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.apiService.deleteEstimate(estimate.id!).subscribe({
        next: () => {
          this.closeViewForm();
          this.loadEstimates();
          this.snackBar.open('Devis supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression du devis', 'Fermer', { duration: 3000 });
        }
      });
    };
    this.showConfirm = true;
  }

  getCustomerFullName(customerId: number | string | null | undefined): string {
    if (!customerId) return 'Client non renseigné';
    // Convertir en nombre si besoin
    const id = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    const customer = this.customers.find(c => c.id === id);
    return customer ? `${customer.surname} ${customer.name}` : 'Client non renseigné';
  }

  getCustomerField(customerId: number | string | null | undefined, field: string): string {
    if (!customerId) return '';
    const id = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    const customer = this.customers.find(c => c.id === id);
    // console.log('getCustomerField', { id, field, customer });
    return customer && customer[field as keyof Customer] ? String(customer[field as keyof Customer]) : '';
  }

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}
