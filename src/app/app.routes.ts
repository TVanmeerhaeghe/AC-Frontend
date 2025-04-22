import { Routes } from '@angular/router';
import { SignInComponent } from './pages/connection/sign-in/sign-in.component';
import { SignUpComponent } from './pages/connection/sign-up/sign-up.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    { path: 'sign-in', component: SignInComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'home', component: HomePageComponent }
];
