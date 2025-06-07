import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/users.model';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    ConfirmPopupComponent
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  users: User[] = [];
  showCreateForm = false;
  form!: FormGroup;
  loading = false;

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.form = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email_adress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['ADMIN', Validators.required]
    });
  }

  fetchUsers() {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.form.reset({ role: 'ADMIN' });
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.form.reset({ role: 'ADMIN' });
  }

  submit() {
    if (this.form.valid) {
      this.api.signUp(this.form.value).subscribe({
        next: () => {
          this.fetchUsers();
          this.closeCreateForm();
          this.snackBar.open('Compte créé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la création du compte', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  askDeleteUser(user: User) {
    const adminCount = this.users.filter(u => u.role === 'ADMIN').length;
    if (user.role === 'ADMIN' && adminCount <= 2) {
      this.confirmTitle = 'Suppression impossible';
      this.confirmMessage = "Il doit toujours rester au moins deux comptes admin.";
      this.confirmAction = null;
      this.showConfirm = true;
      return;
    }
    this.confirmTitle = `Supprimer le compte de <span class="popup-highlight">${user.name} ${user.surname}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.api.deleteUser(user.id).subscribe({
        next: () => {
          this.fetchUsers();
          this.snackBar.open('Compte supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression du compte', 'Fermer', { duration: 3000 });
        }
      });
    };
    this.showConfirm = true;
  }

  askResetMail(user: User) {
    this.confirmTitle = `Réinitialiser le mot de passe de <span class="popup-highlight">${user.name} ${user.surname}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.api.forgotPassword(user.email_adress).subscribe({
        next: () => {
          this.showConfirm = false;
          this.snackBar.open('Mail de réinitialisation envoyé !', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.showConfirm = false;
          this.snackBar.open('Erreur lors de l\'envoi du mail.', 'Fermer', { duration: 3000 });
        }
      });
    };
    this.showConfirm = true;
  }

  onConfirmPopup() {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.showConfirm = false;
  }

  onCancelPopup() {
    this.showConfirm = false;
  }
}
