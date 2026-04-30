import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-shipping-delevary',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './shipping-delevary.component.html',
  styleUrl: './shipping-delevary.component.scss'
})
export class ShippingDelevaryComponent {
  public breadcrumb = {
    title: 'Shipping & Delivery',
    items: [
      {
        label: 'Shipping & Delivery',
        active: true
      }
    ]
  };
}
