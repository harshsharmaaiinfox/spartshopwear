import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-return-exchange',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-exchange.component.html',
  styleUrl: './return-exchange.component.scss'
})
export class ReturnExchangeComponent implements OnInit {

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    // Set unique SEO data for Return Policy page
    this.seoService.setSEOData({
      title: 'Easy 7-Day Return Policy – Shop Risk-Free | Sparkshopwear',
      description: 'Shop with confidence at Sparkshopwear. Our easy 7-day return policy ensures you can shop risk-free. Learn about our simple return and exchange process.',
      keywords: 'return policy, exchange policy, 7-day return, shop risk-free, mangal fashion returns',
      canonicalUrl: 'https://sparkshopwear.com/return-policy',
      url: 'https://sparkshopwear.com/return-policy',
      type: 'website'
    });
  }
}
