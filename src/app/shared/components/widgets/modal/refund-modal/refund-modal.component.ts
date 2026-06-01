import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Select2Data } from 'ng-select2-component';
import { SendRefundRequest } from '../../../../../shared/action/refund.action';
import { Product } from '../../../../../shared/interface/product.interface';

@Component({
  selector: 'app-refund-modal',
  templateUrl: './refund-modal.component.html',
  styleUrls: ['./refund-modal.component.scss']
})
export class RefundModalComponent {

  @ViewChild("refundModal", { static: false }) RefundModal: TemplateRef<string>;

  public closeResult: string;
  public modalOpen: boolean = false;
  public product: Product;
  public isCod: boolean = false;
  public form: FormGroup;

  public option: Select2Data = [];

  private readonly codOptions: Select2Data = [
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Store Wallet Credit', value: 'wallet' },
  ];

  constructor(private modalService: NgbModal, private store: Store ){
    this.form = new FormGroup({
      order_id: new FormControl('', [Validators.required]),
      reason: new FormControl('', [Validators.required]),
      payment_type: new FormControl(''),
      product_id: new FormControl()
    });
  }

  async openModal(product: Product, order_id: number, paymentMethod: string = '') {
    this.product = product;
    this.isCod = paymentMethod === 'cod';
    this.form.controls['order_id'].setValue(order_id);
    this.form.get('product_id')?.patchValue(product.id);

    if (this.isCod) {
      this.option = this.codOptions;
      this.form.controls['payment_type'].setValidators([Validators.required]);
      this.form.controls['payment_type'].setValue('');
    } else {
      // Prepaid: refund goes back to original source automatically
      this.option = [];
      this.form.controls['payment_type'].clearValidators();
      this.form.controls['payment_type'].setValue('source');
    }
    this.form.controls['payment_type'].updateValueAndValidity();

    this.modalOpen = true;
    this.modalService.open(this.RefundModal, {
      ariaLabelledBy: 'profile-Modal',
      centered: true,
      windowClass: 'theme-modal'
    }).result.then((result) => {
      `Result ${result}`
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  sendRequest(){
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.store.dispatch(new SendRefundRequest(this.form.value)).subscribe({
        complete: () => {
          this.form.reset();
          this.modalService.dismissAll();
        }
      });
    }
  }
}
