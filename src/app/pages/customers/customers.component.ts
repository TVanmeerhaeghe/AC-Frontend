import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models/customers.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
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
}
