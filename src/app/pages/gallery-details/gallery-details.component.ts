import { Component, OnInit }              from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { switchMap, map }                 from 'rxjs/operators';
import { EMPTY, forkJoin, of }            from 'rxjs';

import { ApiService }                     from '../../services/api.service';
import { slugify }              from '../../services/slugify.service';
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
  product: Product | null = null;
  selectedCategory: Category | null = null;
  productThumbnails: string[] = [];
  relatedProducts: Product[] = [];

  public slugify = slugify;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const catSlug     = params.get('categorySlug') || 'tous';
          const productSlug = params.get('productSlug');
          if (!productSlug) {
            this.router.navigate(['/galerie','produits',catSlug]);
            return EMPTY;
          }

          return forkJoin({
            cats: this.api.getAllCategories(),
            prods: catSlug === 'tous'
              ? this.api.getAllProducts()
              : this.api.getAllCategories().pipe(
                  map(cats =>
                    cats.find(c => c.slug === catSlug) || null
                  ),
                  switchMap(cat => {
                    if (!cat) {
                      this.router.navigate(['/galerie','produits','tous']);
                      return of([] as Product[]);
                    }
                    this.selectedCategory = cat;
                    return this.api.getProductsByCategory(cat.id);
                  })
                )
          }).pipe(map(({ cats, prods }) => ({ cats, prods, productSlug })));
        })
      )
      .subscribe(({ cats, prods, productSlug }) => {
        if (!this.selectedCategory) {
          this.selectedCategory = { id: 0, name: 'Tous', slug: 'tous', icon: '' };
        }

        const found = prods.find(p => slugify(p.name) === productSlug);
        if (!found) {
          this.router.navigate(['/galerie','produits',this.selectedCategory.slug]);
          return;
        }
        this.product = found;
        this.productThumbnails = found.imageUrl ? [found.imageUrl] : [];

        this.api.getProductsByCategory(found.categoryId)
          .subscribe(rp => {
            this.relatedProducts = rp.filter(p => p.id !== found.id);
          });
      });
  }
}
