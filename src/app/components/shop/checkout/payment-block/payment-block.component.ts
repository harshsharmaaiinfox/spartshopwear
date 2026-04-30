import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Values } from '../../../../shared/interface/setting.interface';

@Component({
  selector: 'app-payment-block',
  templateUrl: './payment-block.component.html',
  styleUrls: ['./payment-block.component.scss']
})
export class PaymentBlockComponent {

  @Input() setting: Values;
  @Output() selectPaymentMethod: EventEmitter<string> = new EventEmitter();

  public selectedMethod: string = '';

  constructor() { }

  ngOnInit() {
    const first = this.setting?.payment_methods?.find(p => p.status);
    if (first) {
      this.selectedMethod = first.name;
      this.selectPaymentMethod.emit(first.name);
    }
  }

  set(value: string) {
    this.selectedMethod = value;
    this.selectPaymentMethod.emit(value);
  }

  getMethodIcon(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('upi') || n.includes('star_mangal') || n.includes('nabu')) return 'ri-smartphone-line';
    if (n.includes('drill') || n.includes('cashfree') || n.includes('card')) return 'ri-bank-card-line';
    if (n.includes('wallet')) return 'ri-wallet-3-line';
    if (n.includes('net')) return 'ri-global-line';
    if (n.includes('cod')) return 'ri-money-rupee-circle-line';
    if (n.includes('qr')) return 'ri-qr-code-line';
    return 'ri-secure-payment-line';
  }

  getMethodSub(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('upi') || n.includes('star_mangal') || n.includes('nabu')) return 'GPay · PhonePe · Paytm & more';
    if (n.includes('drill') || n.includes('cashfree')) return 'Cashfree · Instant & Secure';
    if (n.includes('card')) return 'Visa, Mastercard, Rupay & more';
    if (n.includes('net')) return 'Pay through your favourite bank';
    if (n.includes('cod')) return 'Pay at your doorstep';
    if (n.includes('wallet')) return 'Your wallet balance';
    return 'Fast & Secure checkout';
  }

}
