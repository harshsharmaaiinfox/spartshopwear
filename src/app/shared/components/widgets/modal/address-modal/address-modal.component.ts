import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select, Store } from '@ngxs/store';
import { debounceTime, distinctUntilChanged, Observable, Subject, take, takeUntil } from 'rxjs';
import { Select2Data, Select2UpdateEvent } from 'ng-select2-component';
import { CreateAddress, UpdateAddress } from '../../../../action/account.action';
import { CountryState } from '../../../../state/country.state';
import { AuthState } from '../../../../state/auth.state';
import { UserAddress } from '../../../../interface/user.interface';
import * as data from '../../../../data/country-code';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { PincodeLocationService } from '../../../../services/pincode-location.service';

@Component({
  selector: 'address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddressModalComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public closeResult: string;
  public modalOpen: boolean = false;

  public cityOptions: Select2Data = [];
  public address: UserAddress | null;
  public codes = data.countryCodes;

  public stateNameData: Select2Data = [];
  public officeNameData: Select2Data = [];
  public isLocationLoading = true;

  @ViewChild("addressModal", { static: false }) AddressModal: TemplateRef<string>;
  @Select(CountryState.countries) countries$: Observable<Select2Data>;
  @Select(AuthState.accessToken) accessToken$: Observable<string>;

  public selectedPinCode = '';
  public filterPinCodeAreas: any;
  public checkIfPinCodeExists = true;

  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private store: Store,
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private notificationService: NotificationService,
    private pincodeLocationService: PincodeLocationService
  ) {
    this.form = this.formBuilder.group({
      title: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]*$/)]),
      floor_no: new FormControl(''),
      flat_no: new FormControl(''),
      building: new FormControl(''),
      road: new FormControl(''),
      street: new FormControl('', [Validators.required]),
      state_id: new FormControl('', [Validators.required]),
      country_id: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      area: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required]),
      country_code: new FormControl('91', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)])
    });

    this.form.controls['phone']?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value && value.toString().length > 10) {
        this.form.controls['phone']?.setValue(+value.toString().slice(0, 10));
      }
    });

    this.form.controls['pincode']?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.handlePincodeChange(value));

    setTimeout(() => {
      this.form.controls['country_id'].disable();
      this.form.controls['area'].disable();
      this.form.controls['pincode'].disable();
      this.form.controls['country_code'].disable();
    }, 500);
  }

  ngOnInit(): void {
    this.pincodeLocationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLocationLoading = loading;
        this.cdRef.markForCheck();
      });

    this.loadLocationData();
  }

  loadLocationData(): void {
    this.pincodeLocationService.load().pipe(take(1)).subscribe({
      next: () => {
        this.stateNameData = this.pincodeLocationService.getStateOptions();
        this.cdRef.detectChanges();
      },
      error: () => {
        this.notificationService.showError('Failed to fetch Pincode and Area data');
      }
    });
  }

  downloadPINAreaExcelJSON(): void {
    this.pincodeLocationService.reload();
    this.loadLocationData();
  }

  private handlePincodeChange(value: string | number | null): void {
    if (!value || value.toString().length <= 5 || !this.pincodeLocationService.isReady()) {
      return;
    }

    const checkIfPinCodeExists = this.officeNameData.filter(
      (item: any) => (item.data?.OfficeName ?? item.OfficeName) == this.form.controls['area'].value
    );
    const existingPincode = (checkIfPinCodeExists[0] as any)?.data?.Pincode ?? (checkIfPinCodeExists[0] as any)?.Pincode;

    if (!checkIfPinCodeExists.length || existingPincode !== value) {
      this.checkIfPinCodeExists = false;
      this.filterPinCodeAreas = this.pincodeLocationService.getRecordsByPincode(value);

      if (this.filterPinCodeAreas.length) {
        const matchedRecord = this.filterPinCodeAreas[0];
        this.cityOptions = this.pincodeLocationService.getDistrictsByState(matchedRecord.StateName);
        this.officeNameData = this.pincodeLocationService.getOfficesByDistrict(matchedRecord.District);

        if (!this.officeNameData.length) {
          this.officeNameData = [{ label: 'Other', value: 'Other' }];
        }

        this.form.controls['state_id'].setValue(matchedRecord.StateName);
        setTimeout(() => {
          this.form.controls['city'].setValue(matchedRecord.District);
          this.form.controls['area'].setValue(this.officeNameData[0]?.label ?? '');
          this.checkIfPinCodeExists = true;
        }, 100);
      } else {
        this.checkIfPinCodeExists = true;
        this.form.controls['pincode'].markAsTouched();
        this.form.controls['pincode'].setErrors({ required: true });
        this.notificationService.showError('Invalid Pincode');
      }
    } else {
      this.checkIfPinCodeExists = true;
      this.selectedPinCode = String(value);
    }
  }

  validatePinCode(payload: any) {
    this.authService.validatePinCode(payload).subscribe({
      next: (res) => {
        if (res.status) {
          this.form.controls['pincode'].setErrors(null);
        } else {
          this.form.controls['pincode'].markAsTouched();
          this.form.controls['pincode'].setErrors({ required: true });
          this.notificationService.showError(res.msg);
        }
      }
    });
  }

  countryChange(data: Select2UpdateEvent) {
    if (!data?.value) {
      this.form.controls['state_id'].setValue('');
    }
  }

  stateChange(data: Select2UpdateEvent) {
    if (data?.value && this.checkIfPinCodeExists) {
      this.form.controls['city'].setValue('');
      this.form.controls['area'].setValue('');
      this.form.controls['pincode'].setValue('');
      const selectedState = data.options[0].label as string;
      this.cityOptions = this.pincodeLocationService.getDistrictsByState(selectedState);
      this.officeNameData = [];
    }
  }

  cityChange(data: Select2UpdateEvent) {
    if (data?.value && this.checkIfPinCodeExists) {
      this.form.controls['area'].setValue('');
      this.form.controls['pincode'].setValue('');
      const district = data.value.toString();
      this.officeNameData = this.pincodeLocationService.getOfficesByDistrict(district);

      if (!this.officeNameData.length) {
        this.officeNameData = [{ label: 'Other', value: 'Other' }];
      }

      this.form.controls['area'].enable();
    }
  }

  areaChange(data: Select2UpdateEvent) {
    if (data?.value && this.checkIfPinCodeExists) {
      this.form.controls['pincode'].enable();
      const filterPinCode = this.officeNameData.filter((item: any) => item.label == data.value);
      const pincode = filterPinCode.length
        ? ((filterPinCode[0] as any).data?.Pincode ?? (filterPinCode[0] as any).Pincode)
        : '';
      this.form.controls['pincode'].setValue(pincode);
    }
  }

  async openModal(value?: UserAddress, windowClass?: string) {
    if (!this.pincodeLocationService.isReady()) {
      this.loadLocationData();
    } else {
      this.stateNameData = this.pincodeLocationService.getStateOptions();
    }

    this.modalOpen = true;
    this.patchForm(value);
    this.modalService.open(this.AddressModal, {
      ariaLabelledBy: 'address-add-Modal',
      centered: windowClass ? false : true,
      windowClass: windowClass || 'theme-modal modal-lg address-modal'
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

  patchForm(value?: UserAddress) {
    if (value) {
      this.address = value;
      this.form.patchValue({
        user_id: value?.user_id,
        title: value?.title,
        floor_no: value?.floor_no,
        flat_no: value?.flat_no,
        building: value?.building,
        road: value?.road,
        street: value?.street,
        country_id: value?.country_id,
        state_id: value?.state_id,
        city: value?.city,
        pincode: value?.pincode,
        area: value?.area,
        country_code: value?.country_code,
        phone: value?.phone
      });

      if (value.state_id) {
        this.cityOptions = this.pincodeLocationService.getDistrictsByState(String(value.state_id));
      }
      if (value.city) {
        this.officeNameData = this.pincodeLocationService.getOfficesByDistrict(String(value.city));
      }

      setTimeout(() => this.form.controls['country_code'].setValue('91'), 300);
      setTimeout(() => this.form.controls['state_id'].setValue(value?.state_id), 400);
      setTimeout(() => this.form.controls['city'].setValue(value?.city), 600);
      setTimeout(() => this.form.controls['area'].setValue(value?.area), 800);
    } else {
      this.address = null;
      this.form.reset();
      this.cityOptions = [];
      this.officeNameData = [];
      this.form?.controls?.['country_code'].setValue('91');
    }
  }

  submit() {
    this.form.markAllAsTouched();
    this.form.value['country_id'] = 'INDIA';
    let action = new CreateAddress(this.form.value);

    if (this.address) {
      action = new UpdateAddress(this.form.value, this.address.id);
    }
    if (this.form.valid) {
      this.store.dispatch(action).subscribe({
        complete: () => {
          this.form.reset();
          if (!this.address) {
            this.form?.controls?.['country_code'].setValue('91');
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowedControlKeys.includes(event.key)) return;
    if (!/^[A-Za-z\s]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizeLettersInput(event: Event, controlName: 'title'): void {
    const input = event.target as HTMLInputElement;
    const sanitized = (input.value || '').replace(/[^A-Za-z\s]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.controls[controlName].setValue(sanitized, { emitEvent: false });
    }
  }

  sanitizeLettersPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/[^A-Za-z\s]/.test(pasted)) {
      event.preventDefault();
      const sanitized = pasted.replace(/[^A-Za-z\s]/g, '');
      document.execCommand('insertText', false, sanitized);
    }
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowedControlKeys.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizeDigitsInput(event: Event, controlName: 'phone'): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = (input.value || '').replace(/\D/g, '').slice(0, 10);
    if (digitsOnly !== input.value) {
      input.value = digitsOnly;
      this.form.controls[controlName].setValue(digitsOnly, { emitEvent: false });
    }
  }

  sanitizeDigitsPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/\D/.test(pasted)) {
      event.preventDefault();
      const sanitized = pasted.replace(/\D/g, '').slice(0, 10);
      document.execCommand('insertText', false, sanitized);
    }
  }
}
