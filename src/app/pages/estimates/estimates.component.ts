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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  async downloadEstimatePdf() {
    if (!this.viewEstimateData) return;

    const formatDate = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR');
    };

    const rawPhone = this.getCustomerField(this.viewEstimateData.customerId!, 'phone');
    const phone = rawPhone && !rawPhone.startsWith('0') ? '0' + rawPhone : rawPhone;

    let tvaRows = '';
    if (this.prestationTasks.length > 0) {
      const tvaDetails = this.prestationTVADetails;
      if (tvaDetails.length > 0) {
        tvaRows = `
          <div style="margin-top:12px;text-align:right;">
            <b>Détail TVA :</b>
            <ul style="list-style:none;padding:0;margin:0;">
              ${tvaDetails.map(tva =>
                `<li>TVA ${tva.tva}% : ${tva.montant.toFixed(2)} €</li>`
              ).join('')}
            </ul>
          </div>
        `;
      }
    }

    const pdfContent = document.createElement('div');
    pdfContent.style.width = '800px';
    pdfContent.style.padding = '32px';
    pdfContent.style.background = '#fff';
    pdfContent.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="max-width:50%">
          <img src="/assets/img/logo.png" alt="LVDB" style="height:60px;margin-bottom:8px;">
          <div style="font-weight:bold;font-size:1.2em;">Village des Brocanteurs</div>
          <div>10B Rue du Pré Baron,<br>27500 Pont-Audemer</div>
          <div>Tel : 06 37 74 77 05</div>
        </div>
        <div style="text-align:right;max-width:45%">
          <div style="font-weight:bold;">Client</div>
          <div>${this.getCustomerFullName(this.viewEstimateData.customerId)}</div>
          <div>${this.getCustomerField(this.viewEstimateData.customerId!, 'adress')}</div>
          <div>${this.getCustomerField(this.viewEstimateData.customerId!, 'postal_code')} ${this.getCustomerField(this.viewEstimateData.customerId!, 'city')}</div>
          <div>Tel : ${phone}</div>
          <div>${this.getCustomerField(this.viewEstimateData.customerId!, 'email')}</div>
        </div>
      </div>
      <hr style="margin:24px 0;">
      <div>
        <div style="font-size:1.1em;margin-bottom:8px;"><b>Devis du ${formatDate(
          typeof this.viewEstimateData.creationDate === 'string'
            ? this.viewEstimateData.creationDate
            : this.viewEstimateData.creationDate.toISOString()
        )} n°${this.viewEstimateData.id}</b></div>
        <div><b>Objet :</b> ${this.viewEstimateData.object}</div>
        <div><b>Statut :</b> ${this.viewEstimateData.status}</div>
      </div>
      <div style="margin-top:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ccc;text-align:left;">Désignation</th>
              <th style="border-bottom:1px solid #ccc;">Quantité</th>
              <th style="border-bottom:1px solid #ccc;">Prix unitaire</th>
              <th style="border-bottom:1px solid #ccc;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              this.prestationTasks.map(task => `
                <tr>
                  <td>${task.name}</td>
                  <td style="text-align:center;">${task.hours ?? 1}</td>
                  <td style="text-align:right;">${task.hourly_rate?.toFixed(2) ?? '0.00'} €</td>
                  <td style="text-align:right;">${((task.hours ?? 0) * (task.hourly_rate ?? 0)).toFixed(2)} €</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
      ${tvaRows}
      <div style="margin-top:24px;text-align:right;">
        <div><b>Total TTC :</b> ${this.prestationTotalTTC.toFixed(2)} €</div>
      </div>
      <div style="margin-top:16px;">
        <b>Note :</b> ${this.viewEstimateData.adminNote ?? ''}
      </div>
    `;

    document.body.appendChild(pdfContent);

    const canvas = await html2canvas(pdfContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Devis_${this.viewEstimateData.id}.pdf`);

    document.body.removeChild(pdfContent);
  }
}
