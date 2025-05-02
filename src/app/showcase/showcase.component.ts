import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderCustomerComponent } from '../navigation/header-customer/header-customer.component';
import { FooterCustomerComponent } from '../navigation/footer-customer/footer-customer.component';

@Component({
  selector: 'app-showcase',
  imports: [RouterOutlet, HeaderCustomerComponent, FooterCustomerComponent],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {}
