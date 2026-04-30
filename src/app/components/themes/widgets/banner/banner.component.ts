import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as data from '../../../../shared/data/owl-carousel';

@Component({
  selector: 'app-theme-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {

  @Input() style: string = 'horizontal';
  @Input() class: string | null;
  @Input() contentClass: string;
  @Input() banners: any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  public bannerSlider = data.bannerSlider;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
  }
}
