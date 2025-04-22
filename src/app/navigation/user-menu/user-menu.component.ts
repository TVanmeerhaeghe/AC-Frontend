import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ParametersComponent } from '../../pages/parameters/parameters.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [ ParametersComponent, RouterModule, CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }

  login(): void {
    this.router.navigate(['/sign-in']);
  }
}
