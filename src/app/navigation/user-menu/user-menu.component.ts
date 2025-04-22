import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent {
  constructor(
    private AuthService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.AuthService.logout();
    this.router.navigate(['/sign-in']);
  }
}
