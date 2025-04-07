import { Component } from '@angular/core';
import { MenuComponent } from '../../navigation/menu/menu.component';
// import { FooterComponent } from '../../navigation/footer/footer.component'; FooterComponent

@Component({
  selector: 'app-home-page',
  imports: [MenuComponent,],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
