import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { slugify } from '../../services/slugify.service';
import { Category } from '../../models/categories.model';
import { Product } from '../../models/products.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  products: Product[] = [];
  currentSearch: string | null = null;

  public slugify = slugify;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api
      .getAllCategories()
      .pipe(
        tap((cats) => (this.categories = cats)),
        switchMap(() =>
          this.route.queryParamMap.pipe(
            switchMap((qParams) => {
              const q = qParams.get('q')?.trim() || null;
              if (q) {
                this.currentSearch = q;
                this.selectedCategory = null;
                return this.api
                  .searchProducts(q)
                  .pipe(tap((results) => (this.products = results)));
              } else {
                this.currentSearch = null;
                return this.route.paramMap.pipe(
                  switchMap((params) => {
                    const slug = params.get('categorySlug');
                    if (!slug || slug === 'tous') {
                      this.selectedCategory = null;
                      return this.api
                        .getAllProducts()
                        .pipe(tap((prods) => (this.products = prods)));
                    }
                    const cat = this.categories.find((c) => c.slug === slug);
                    if (!cat) {
                      this.router.navigate(['/galerie', 'produits', 'tous']);
                      return EMPTY;
                    }
                    this.selectedCategory = cat;
                    return this.api
                      .getProductsByCategory(cat.id)
                      .pipe(tap((prods) => (this.products = prods)));
                  })
                );
              }
            })
          )
        )
      )
      .subscribe({
        next: () => {},
        error: () => {
          this.products = [];
        },
      });
  }
}
