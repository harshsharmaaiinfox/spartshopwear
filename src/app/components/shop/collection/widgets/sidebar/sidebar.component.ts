import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AttributeService } from '../../../../../shared/services/attribute.service';
import { Params } from '../../../../../shared/interface/core.interface';
import { AttributeModel } from '../../../../../shared/interface/attribute.interface';
import { AttributeState } from '../../../../../shared/state/attribute.state';
import { GetAttributes } from '../../../../../shared/action/attribute.action';
import { BrandState } from '../../../../../shared/state/brand.state';
import { BrandModel } from '../../../../../shared/interface/brand.interface';
import { GetBrands } from '../../../../../shared/action/brand.action';

@Component({
  selector: 'app-collection-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class CollectionSidebarComponent implements OnChanges {

  @Input() filter: Params;
  @Input() hideFilter: string[];

  @Select(AttributeState.attribute) attribute$: Observable<AttributeModel>;
  @Select(BrandState.brand) brand$: Observable<BrandModel>;

  sizes = [ 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSizes: string[] = [];

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    public attributeService: AttributeService
  ) {
    this.store.dispatch(new GetAttributes({ status: 1 }));
    this.store.dispatch(new GetBrands({ status: 1 }));
  }

  ngOnChanges() {
    // Sync selected sizes from URL attribute param
    const attrs: string[] = this.filter?.['attribute']
      ? this.filter['attribute'].split(',')
      : [];
    this.selectedSizes = attrs.filter(a =>
      this.sizes.map(s => this.toSlug(s)).includes(a)
    );
  }

  toggleSize(size: string) {
    const slug = this.toSlug(size);

    // Get current non-size attributes
    const currentAttrs: string[] = this.filter?.['attribute']
      ? this.filter['attribute'].split(',').filter((a: string) => a)
      : [];
    const nonSizeAttrs = currentAttrs.filter(
      a => !this.sizes.map(s => this.toSlug(s)).includes(a)
    );

    // Toggle the clicked size
    const idx = this.selectedSizes.indexOf(slug);
    if (idx === -1) {
      this.selectedSizes.push(slug);
    } else {
      this.selectedSizes.splice(idx, 1);
    }

    const allAttrs = [...nonSizeAttrs, ...this.selectedSizes].filter(Boolean);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        attribute: allAttrs.length ? allAttrs.join(',') : null,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(this.toSlug(size));
  }

  private toSlug(size: string): string {
    return size.toLowerCase().replace(/\s+/g, '-');
  }

  removeCategory(slug: string) {
    const current: string[] = this.filter?.['category']
      ? this.filter['category'].split(',').filter((c: string) => c && c !== slug)
      : [];
    const path = current.length ? `/collections/${current.join(',')}` : '/collections';
    this.router.navigate([path]);
  }

  clearFilter() {
    this.router.navigate(['/collections']);
  }
}
