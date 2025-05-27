import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MenuComponent } from '../navigation/menu/menu.component';
import { RouterOutlet } from '@angular/router';
import { UserMenuComponent } from '../navigation/user-menu/user-menu.component';
import { SearchBarComponent } from '../navigation/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet ,MenuComponent ,UserMenuComponent, SearchBarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  pageTitle = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.route.firstChild;
        while (child?.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data['title'] || '';
      })
    ).subscribe(title => this.pageTitle = title);
  }
}
