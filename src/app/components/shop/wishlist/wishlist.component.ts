import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetWishlist, DeleteWishlist } from './../../../shared/action/wishlist.action';
import { AddToCart } from '../../../shared/action/cart.action';
import { WishlistState } from '../../../shared/state/wishlist.state';
import { Breadcrumb } from '../../../shared/interface/breadcrumb';
import { WishlistModel } from '../../../shared/interface/wishlist.interface';
import { WishlistService } from '../../../shared/services/wishlist.service';
import { ThemeOptionState } from '../../../shared/state/theme-option.state';
import { Option } from '../../../shared/interface/theme-option.interface';
import { Product } from '../../../shared/interface/product.interface';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent {

  @Select(WishlistState.wishlistItems) wishlistItems$: Observable<WishlistModel>;
  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;

  public breadcrumb: Breadcrumb = {
    title: "Wishlist",
    items: [{ label: 'Wishlist', active: true }]
  };

  public skeletonItems = Array.from({ length: 12 }, (_, index) => index);

  constructor(private store: Store, public wishlistService: WishlistService) {
    this.store.dispatch(new GetWishlist());
  }

  removeWishlist(product: Product) {
    this.store.dispatch(new DeleteWishlist(product?.id));
  }

  addToCart(product: Product) {
    if (product?.stock_status !== 'in_stock') return;
    const params = {
      id: null,
      product_id: product?.id,
      product: product,
      variation_id: null,
      variation: null,
      quantity: 1
    };
    this.store.dispatch(new AddToCart(params));
  }

  isOnSale(product: Product): boolean {
    return (product?.sale_price ?? 0) < (product?.price ?? 0);
  }

  getDiscount(product: Product): number {
    const price = product?.price ?? 0;
    const sale = product?.sale_price ?? 0;
    if (!price || price <= sale) return 0;
    return Math.round(((price - sale) / price) * 100);
  }

  getDiff(product: Product): number {
    return (product?.price ?? 0) - (product?.sale_price ?? 0);
  }

  getAvgRating(product: Product): number {
    const ratings = product?.review_ratings;
    if (!ratings?.length) return 0;
    return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
