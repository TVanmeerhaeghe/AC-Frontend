import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParametersComponent } from '../../pages/parameters/parameters.component';


@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [ParametersComponent, RouterModule],
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
