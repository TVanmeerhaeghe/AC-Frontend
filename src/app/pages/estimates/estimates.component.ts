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
import { Task } from '../../models/tasks.model';
import { lastValueFrom } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';

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
    ConfirmPopupComponent,
    MatChipsModule
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

  tvaValues: string[] = [];
  prestationTasks: Partial<Task>[] = [];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEstimates();
    this.loadCustomers();
    // TVA
    this.apiService.getTvaValues?.().subscribe?.({
      next: (values: string[]) => { this.tvaValues = values; },
      error: () => { this.tvaValues = ['20.00', '21.20']; }
    });

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
    this.prestationTasks = [];
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
    this.prestationTasks = [];
    if (estimate.id) {
      this.apiService.getAllTasks?.().subscribe?.((tasks: Task[]) => {
        this.prestationTasks = tasks.filter(t => t.estimate_id === estimate.id);
      });
    }
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
  isLastTaskValid(): boolean {
    if (this.prestationTasks.length === 0) return true;
    const last = this.prestationTasks[this.prestationTasks.length - 1];
    if (!last) return false;
    if (!last.name || last.name.trim() === '') return false;
    if (!last.hours || last.hours <= 0) return false;
    if (!last.hourly_rate || last.hourly_rate <= 0) return false;
    return true;
  }

  // Totau
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

  async submitForm() {
    // Mapping correct des champs pour l'API
    const formToSubmit: any = {
      creation_date: this.createForm.creationDate
        ? new Date(this.createForm.creationDate).toISOString().substring(0, 10)
        : '',
      validity_date: this.createForm.validityDate
        ? new Date(this.createForm.validityDate).toISOString().substring(0, 10)
        : '',
      object: this.createForm.object,
      status: this.createForm.status,
      admin_note: this.createForm.adminNote,
      customer_id: this.createForm.customerId,
      discount_name: this.createForm.discountName,
      discount_value: this.createForm.discountValue,
      final_note: this.createForm.finalNote
    };

    if (this.editMode && this.editEstimateId) {
      this.apiService.updateEstimate(this.editEstimateId, formToSubmit).subscribe({
        next: async (estimate) => {
          const estimateId = estimate?.id ?? this.editEstimateId;
          const saveTasks$ = this.prestationTasks.map(task => {
            if ((task as any).id) {
              return lastValueFrom(this.apiService.updateTask((task as any).id, { ...task, estimate_id: estimateId }));
            } else {
              return lastValueFrom(this.apiService.createTask({ ...task, estimate_id: estimateId }));
            }
          });
          await Promise.all(saveTasks$);
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
        next: async (response) => {
          let estimateId =
            (response && (response as any).estimate && (response as any).estimate.id) ? (response as any).estimate.id :
            (response && (response as any).estimate_id) ? (response as any).estimate_id :
            (response && (response as any).id) ? (response as any).id :
            (Array.isArray(response) && response[0]?.id) ? response[0].id :
            undefined;
          if (!estimateId) {
            this.snackBar.open('Erreur : id de devis introuvable', 'Fermer', { duration: 3000 });
            return;
          }
          const saveTasks$ = this.prestationTasks.map(task =>
            lastValueFrom(this.apiService.createTask({ ...task, estimate_id: estimateId }))
          );
          await Promise.all(saveTasks$);
          this.closeCreateForm();
          this.loadEstimates();
          this.snackBar.open('Devis et tâches créés avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création du devis', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // Ajout de la fonction de conversion snake_case -> camelCase
  private toCamelCaseEstimate(estimate: any): Estimate {
    return {
      id: estimate.id,
      creationDate: new Date(estimate.creation_date ?? estimate.creationDate),
      validityDate: new Date(estimate.validity_date ?? estimate.validityDate),
      object: estimate.object,
      status: estimate.status,
      adminNote: estimate.admin_note ?? estimate.adminNote,
      customerId: estimate.customer_id ?? estimate.customerId,
      discountName: estimate.discount_name ?? estimate.discountName,
      discountValue: estimate.discount_value ?? estimate.discountValue,
      finalNote: estimate.final_note ?? estimate.finalNote,
      createdAt: new Date(estimate.created_at ?? estimate.createdAt),
      updatedAt: new Date(estimate.updated_at ?? estimate.updatedAt),
      estimate_id: estimate.estimate_id
    };
  }

  viewEstimate(estimate: Estimate) {
    this.closeCreateForm();
    this.apiService.getEstimate(estimate.id!).subscribe({
      next: (data) => {
        // Conversion ici
        this.viewEstimateData = this.toCamelCaseEstimate(data);
        this.showViewForm = true;
        this.apiService.getAllTasks?.().subscribe?.((tasks: Task[]) => {
          this.prestationTasks = tasks.filter(t => t.estimate_id === data.id);
        });
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
    const id = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    const customer = this.customers.find(c => c.id === id);
    return customer ? `${customer.surname} ${customer.name}` : 'Client non renseigné';
  }

  getCustomerField(customerId: number | string | null | undefined, field: string): string {
    if (!customerId) return '';
    const id = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    const customer = this.customers.find(c => c.id === id);
    return customer && customer[field as keyof Customer] ? String(customer[field as keyof Customer]) : '';
  }

  getEstimateTotalTVA(estimate: any): number {
  if (!estimate || !estimate.prestationTasks || !Array.isArray(estimate.prestationTasks)) {
    return 0;
  }
  let totalTVA = 0;
  for (const task of estimate.prestationTasks) {
    const hours = Number(task.hours) || 0;
    const rate = Number(task.hourly_rate) || 0;
    const tva = Number(task.tva) || 0;
    totalTVA += (hours * rate) * (tva / 100);
  }
  return totalTVA;
}

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }
}
