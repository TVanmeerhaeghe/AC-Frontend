import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule, Router, NavigationStart }     from '@angular/router';
import { debounceTime, switchMap, map, filter } from 'rxjs/operators';

import { ApiService }               from '../../services/api.service';
import { slugify }                  from '../../services/slugify.service';
import { Category }                 from '../../models/categories.model';
import { Product }                  from '../../models/products.model';

@Component({
  selector: 'app-header-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './header-customer.component.html',
  styleUrls: ['./header-customer.component.scss']
})
export class HeaderCustomerComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions: Product[] = [];
  categories: Category[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(evt => evt instanceof NavigationStart))
      .subscribe(() => {
        this.suggestions = [];
      });
  }

  ngOnInit() {
    this.api.getAllCategories().subscribe({
      next: cats => this.categories = cats,
      error: () => this.categories = []
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      filter((val): val is string => val !== null && val.trim().length > 0),
      switchMap((term: string) =>
        this.api.searchProducts(term).pipe(
          map(results => results.slice(0, 5))
        )
      )
    ).subscribe({
      next: prods => this.suggestions = prods,
      error: () => this.suggestions = []
    });
  }

  onSubmitSearch(event: Event) {
    event.preventDefault();

    const q = this.searchControl.value?.trim();
    if (!q) {
      return;
    }

    this.router.navigate(['/galerie', 'recherche'], { queryParams: { q } });

    this.searchControl.setValue('');
    this.suggestions = [];
  }

  goToProduct(prod: Product) {
    const cat = this.categories.find(c => c.id === prod.category_id);
    const categorySlug = cat ? cat.slug : 'tous';
    const productSlug = slugify(prod.name);
    this.router.navigate([
      '/galerie', 'produits',
      categorySlug,
      productSlug
    ]);
    this.searchControl.setValue('');
    this.suggestions = [];
  }
}
