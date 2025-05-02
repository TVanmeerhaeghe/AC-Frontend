import { Component } from '@angular/core';
import { MenuComponent } from '../navigation/menu/menu.component';
import { RouterOutlet } from '@angular/router';
import { UserMenuComponent } from '../navigation/user-menu/user-menu.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet ,MenuComponent ,UserMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  
}
