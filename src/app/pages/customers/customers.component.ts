import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/customers.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCustomers();
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
        }
      });
    } else {
      this.apiService.createCustomer(this.createForm).subscribe({
        next: () => {
          this.closeCreateForm();
          this.loadCustomers();
        }
      });
    }
  }
}
