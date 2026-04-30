import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  public breadcrumb = {
    title: 'Privacy Policy',
    items: [
      {
        label: 'Privacy Policy',
        active: true
      }
    ]
  };
}
