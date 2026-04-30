import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-refund-and-cancellation',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './refund-and-cancellation.component.html',
  styleUrl: './refund-and-cancellation.component.scss'
})
export class RefundAndCancellationComponent {
  public breadcrumb = {
    title: 'Refund & Cancellation',
    items: [
      {
        label: 'Refund & Cancellation',
        active: true
      }
    ]
  };
}
