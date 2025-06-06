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
import { GalleryContactComponent } from './pages/gallery-contact/gallery-contact.component';
import { GalleryAboutUsComponent } from './pages/gallery-about-us/gallery-about-us.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { ResetPasswordComponent } from './pages/connection/reset-password/reset-password.component';
import { MailComponent } from './pages/mail/mail.component';

export const routes: Routes = [
    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    { path: 'sign-in', component: SignInComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    // { path: 'sign-up', component: SignUpComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], 
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomePageComponent, data: { title: 'Accueil' } },
            { path: 'calendar', component: CalendarComponent , data: { title: 'Calendrier' } },
            { path: 'customers', component: CustomersComponent , data: { title: 'Clients' } },
            { path: 'invoices', component: InvoicesComponent , data: { title: 'Factures' } },
            { path: 'estimates', component: EstimatesComponent , data: { title: 'Devis' } },
            { path: 'categories', component: CategoriesComponent ,data: { title: 'Catégories' } },
            { path: 'product', component: ProductsComponent ,data: { title: 'Produits' } },
            { path: 'account', component: AccountsComponent , data: { title: 'Comptes' } },
            { path: 'mail', component: MailComponent , data: { title: 'Emails' } },
            { path: 'parameters', component: ParametersComponent , data: { title: 'Paramètres' } },
          ]
        },
    { path: 'galerie', component: ShowcaseComponent, 
      children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'produits', redirectTo: 'produits/tous', pathMatch: 'full' },
          { path: 'produits/:categorySlug', component: GalleryComponent },
          { path: 'produits/:categorySlug/:productSlug', component: GalleryDetailsComponent },
          { path: 'contact', component: GalleryContactComponent },
          { path: 'a-propos', component: GalleryAboutUsComponent },
          { path: 'recherche', component: GalleryComponent },
        ] 
      },
];
