import { Component } from '@angular/core';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [UserMenuComponent, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

}
