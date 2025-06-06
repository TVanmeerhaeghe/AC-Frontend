import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/users.model';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatInputModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  users: User[] = [];
  showCreateForm = false;
  form!: FormGroup;
  loading = false;

  constructor(private api: ApiService, private fb: FormBuilder) {}

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
        }
      });
    }
  }

  deleteUser(user: User) {
    const adminCount = this.users.filter(u => u.role === 'ADMIN').length;

    if (user.role === 'ADMIN' && adminCount <= 2) {
      alert("Il doit toujours rester au moins deux comptes admin.");
      return;
    }

    if (confirm(`Supprimer le compte de ${user.name} ${user.surname} ?`)) {
      this.api.deleteUser(user.id).subscribe({
        next: () => this.fetchUsers()
      });
    }
  }

  sendResetMail(user: User) {
    if (confirm(`Envoyer un mail de réinitialisation à ${user.email_adress} ?`)) {
      this.api.forgotPassword(user.email_adress).subscribe({
        next: () => alert('Mail de réinitialisation envoyé !'),
        error: () => alert('Erreur lors de l\'envoi du mail.')
      });
    }
  }
}
