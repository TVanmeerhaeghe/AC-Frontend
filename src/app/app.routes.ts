import { Routes } from '@angular/router';
import { SignInComponent } from './pages/connection/sign-in/sign-in.component';
import { SignUpComponent } from './pages/connection/sign-up/sign-up.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { EstimatesComponent } from './pages/estimates/estimates.component';
import { ProductsComponent } from './pages/products/products.component';
import { ParametersComponent } from './pages/parameters/parameters.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { GalleryDetailsComponent } from './pages/gallery-details/gallery-details.component';

export const routes: Routes = [
    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], 
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomePageComponent, data: { title: 'Accueil' } },
            { path: 'calendar', component: CalendarComponent , data: { title: 'Calendrier' } },
            { path: 'customers', component: CustomersComponent , data: { title: 'Clients' } },
            { path: 'invoices', component: InvoicesComponent , data: { title: 'Factures' } },
            { path: 'estimates', component: EstimatesComponent , data: { title: 'Devis' } },
            { path: 'product', component: ProductsComponent ,data: { title: 'Produits' } },
            { path: 'parameters', component: ParametersComponent , data: { title: 'Paramètres' } },
          ]
        },
    { path: 'galerie', component: ShowcaseComponent, 
      children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'produits', redirectTo: 'produits/tous', pathMatch: 'full' },
          { path: 'produits/:categorySlug', component: GalleryComponent },
          { path: 'produits/:categorySlug/:productSlug', component: GalleryDetailsComponent },
        ] 
      },
];
