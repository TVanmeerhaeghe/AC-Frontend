import { Component, OnInit }              from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap, map }                 from 'rxjs/operators';
import { EMPTY, forkJoin }                from 'rxjs';

import { ApiService }                     from '../../services/api.service';
import { slugify }                        from '../../services/slugify.service';
import { Category }                       from '../../models/categories.model';
import { Product }                        from '../../models/products.model';

@Component({
  selector: 'app-gallery-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery-details.component.html',
  styleUrls: ['./gallery-details.component.scss']
})
export class GalleryDetailsComponent implements OnInit {
  product: Product | null         = null;
  selectedCategory: Category | null = null;
  relatedProducts: Product[]      = [];
  selectedImageUrl: string | null = null;

  public slugify = slugify;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const productSlug = params.get('productSlug');
        if (!productSlug) {
          this.router.navigate(['/galerie', 'produits', 'tous']);
          return EMPTY;
        }

        return forkJoin({
          cats:  this.api.getAllCategories(),
          prods: this.api.getAllProducts(),
        }).pipe(
          map(({ cats, prods }) => ({ cats, prods, productSlug }))
        );
      })
    ).subscribe(({ cats, prods, productSlug }) => {
      const found = prods.find(p => this.slugify(p.name) === productSlug);
      if (!found) {
        this.router.navigate(['/galerie','produits','tous']);
        return;
      }
      this.product = found;

      const realCat = cats.find(c => c.id === found.category_id);
      if (realCat) {
        this.selectedCategory = realCat;
      } else {
        this.selectedCategory = { id: 0, name: 'Tous', slug: 'tous', icon: '' };
      }

      this.selectedImageUrl = 
        found.imageUrls?.[0] || found.imageUrl || null;

      this.api.getCategoryProducts(found.category_id)
        .subscribe(rp => {
          this.relatedProducts = rp.filter(p => p.id !== found.id);
        });
    });
  }
}
