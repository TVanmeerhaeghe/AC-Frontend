import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { ApiService } from '../../services/api.service';
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

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getAllCategories().subscribe((cats) => (this.categories = cats));

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('categorySlug');
          if (!slug || slug === 'tous') {
            this.selectedCategory = null;
            return this.api.getAllProducts();
          }
          const cat = this.categories.find((c) => c.slug === slug);
          if (!cat) {
            this.router.navigate(['/galerie', 'produits', 'tous']);
            return EMPTY;
          }
          this.selectedCategory = cat;
          return this.api.getProductsByCategory(cat.id);
        })
      )
      .subscribe((prods) => {
        console.log('Produits reçus →', prods);
        this.products = prods;
      });
  }
}
