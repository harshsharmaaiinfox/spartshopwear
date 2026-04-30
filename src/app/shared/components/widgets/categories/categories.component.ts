import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Category, CategoryModel } from '../../../interface/category.interface';
import { CategoryState } from '../../../state/category.state';
import { AttributeService } from '../../../services/attribute.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  @Select(CategoryState.category) category$: Observable<CategoryModel>;

  @Input() categoryIds: number[] = [];
  @Input() fixedCategories: any[] = [];
  @Input() style: string = 'vertical';
  @Input() title?: string;
  @Input() image?: string;
  @Input() theme: string;
  @Input() sliderOption: OwlOptions;
  @Input() selectedCategoryId: number;
  @Input() bgImage: string;

  @Output() selectedCategory: EventEmitter<number> = new EventEmitter();

  public categories: Category[] = [];
  public selectedCategorySlug: string[] = [];

  constructor(private route: ActivatedRoute,
    public attributeService: AttributeService,
    private router: Router) {
    this.route.params.subscribe(params => {
      this.selectedCategorySlug = params['category'] ? params['category'].split(',') : [];
    });
  }

  ngOnInit() {
    if (this.fixedCategories?.length) {
      this.categories = this.fixedCategories;
      return;
    }

    this.category$.subscribe(res => {
      if (this.categoryIds?.length) {
        this.categories = res.data.filter(c => this.categoryIds.includes(c.id));
      } else {
        this.categories = res.data;
      }
    });
  }

  ngOnChanges() {
    if (this.fixedCategories?.length) {
      this.categories = this.fixedCategories;
    }
  }

  selectCategory(id?: number) {
    this.selectedCategory.emit(id);
  }

  redirectToCollection(slug: string) {
    let index = this.selectedCategorySlug.indexOf(slug);
    if(index === -1)
      this.selectedCategorySlug.push(slug);
    else
      this.selectedCategorySlug.splice(index,1);

    const categoryPath = this.selectedCategorySlug.length ? this.selectedCategorySlug.join(',') : null;
    this.router.navigate([categoryPath ? `/collections/${categoryPath}` : '/collections']);
  }

  closeCanvasMenu() {
    this.attributeService.offCanvasMenu = false;
  }

}
