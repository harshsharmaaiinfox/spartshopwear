import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-term-condition',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './term-condition.component.html',
  styleUrl: './term-condition.component.scss'
})
export class TermConditionComponent {
  public breadcrumb = {
    title: 'Terms & Conditions',
    items: [
      {
        label: 'Terms & Conditions',
        active: true
      }
    ]
  };
}
