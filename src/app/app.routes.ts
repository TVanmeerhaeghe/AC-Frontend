import { Routes } from '@angular/router';
import { SignInComponent } from './pages/connection/sign-in/sign-in.component';
import { SignUpComponent } from './pages/connection/sign-up/sign-up.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { EstimatesComponent } from './pages/estimates/estimates.component';
import { ProductsComponent } from './pages/products/products.component';
import { ParametersComponent } from './pages/parameters/parameters.component';
import { ShowcaseComponent } from './showcase/showcase.component';

export const routes: Routes = [
    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], 
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomePageComponent },
            { path: 'calendar', component: CalendarComponent },
            { path: 'clients', component: ClientsComponent },
            { path: 'invoices', component: InvoicesComponent },
            { path: 'estimates', component: EstimatesComponent },
            { path: 'product', component: ProductsComponent },
            { path: 'parameters', component: ParametersComponent }
          ]
        },
    { path: 'galerie', component: ShowcaseComponent, 
      children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
        ] 
      },
];
