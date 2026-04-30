import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-filter',
  templateUrl: './collection-filter.component.html',
  styleUrls: ['./collection-filter.component.scss']
})
export class CollectionFilterComponent implements OnChanges {

  @Input() filter: Params;
  public filters: string[];

  public filtersObj: { [key: string]: string[] } = {
    category: [],
    brand: [],
    tag: [],
    rating: [],
    price: [],
    attribute: []
  };

  constructor(private route: ActivatedRoute,
    private router: Router) {}

  ngOnChanges() {
    this.filtersObj = {
      category: this.splitFilter('category'),
      brand: this.splitFilter('brand'),
      tag: this.splitFilter('tag'),
      rating: this.splitFilter('rating'),
      price: this.splitFilter('price'),
      attribute: this.splitFilter('attribute')
    };

    this.filters = this.mergeFilters();
  }

  remove(tag: string) {
    Object.keys(this.filtersObj).forEach((key) => {
      this.filtersObj[key] = this.filtersObj[key].filter((val: string) => {
        if (key === 'rating') {
          return val !== tag.replace(/^rating /, '');
        }
        return val !== tag;
      });
    });

    this.filters = this.mergeFilters();

    // Category lives in the route PATH (/collections/slug), not query params.
    // All other filters are query params.
    const queryParams: Params = {};
    Object.keys(this.filtersObj).forEach((key) => {
      if (key !== 'category') {
        queryParams[key] = this.filtersObj[key].length ? this.filtersObj[key].join(',') : null;
      }
    });

    const categoryPath = this.filtersObj['category'].length
      ? this.filtersObj['category'].join(',')
      : null;

    this.router.navigate(
      [categoryPath ? `/collections/${categoryPath}` : '/collections'],
      { queryParams }
    );
  }

  clear() {
    this.router.navigate(['/collections'], { queryParams: null });
  }

  private splitFilter(filterKey: keyof Params): string[] {
    return this.filter && this.filter[filterKey] ? this.filter[filterKey].split(',') : [];
  }

  private mergeFilters(): string[] {
    return [
      ...this.filtersObj['category'],
      ...this.filtersObj['brand'],
      ...this.filtersObj['tag'],
      ...this.filtersObj['rating'].map(val => val.startsWith('rating ') ? val : `rating ${val}`),
      ...this.filtersObj['price'],
      ...this.filtersObj['attribute']
    ];
  }
}
