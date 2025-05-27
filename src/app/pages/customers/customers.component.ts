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
    address: '',
    postal_code: '',
    city: '',
    compagny: ''
  };

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
    this.createForm = {
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      compagny: ''
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createCustomer() {
    this.apiService.createCustomer(this.createForm).subscribe({
      next: () => {
        this.closeCreateForm();
        this.loadCustomers();
      }
    });
  }
}
