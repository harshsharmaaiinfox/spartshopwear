import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CustomValidators } from '../../../shared/validator/password-match';
import { Register, VerifyRegistrationOtp } from '../../../shared/action/auth.action';
import { Breadcrumb } from '../../../shared/interface/breadcrumb';
import { SettingState } from '../../../shared/state/setting.state';
import { ThemeOptionState } from '../../../shared/state/theme-option.state';
import { Option } from '../../../shared/interface/theme-option.interface';
import { Values } from '../../../shared/interface/setting.interface';
import * as data from '../../../shared/data/country-code';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  @Select(SettingState.setting) setting$: Observable<Values>;
  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;

  public form: FormGroup;
  public breadcrumb: Breadcrumb = {
    title: "Sign In",
    items: [{ label: 'Sign In', active: true }]
  }
  public codes = data.countryCodes;
  public tnc = new FormControl(false, [Validators.requiredTrue]);


  public reCaptcha: boolean = true;
  public showPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  public showOtpOverlay: boolean = false;
  public registeredEmail: string = '';
  public otpValue: string = '';
  public otpLoading: boolean = false;
  public otpError: string = '';


  constructor(
    private store: Store,
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.form = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z\s]*$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
      country_code: new FormControl('91', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      password_confirmation: new FormControl('', [Validators.required]),
      recaptcha: new FormControl(null, Validators.required)
    },{validator : CustomValidators.MatchValidator('password', 'password_confirmation')});

    this.setting$.subscribe(seting => {
      if((seting?.google_reCaptcha && !seting?.google_reCaptcha?.status) || !seting?.google_reCaptcha) {
        this.form.removeControl('recaptcha');
        this.reCaptcha = false;
      } else {
        this.form.setControl('recaptcha', new FormControl(null, Validators.required))
        this.reCaptcha = true;
      }
    });

    this.form.get('country_code')?.disable();
    this.form.controls['phone']?.valueChanges.subscribe((value) => {
      if(value && value.toString().length < 10) {
        this.form.controls['phone'].markAsTouched();
        this.form.controls['phone'].setErrors({invalid: true});
      }
      if(value && value.toString().length > 10) {
        this.form.controls['phone']?.setValue(+value.toString().slice(0, 10), { emitEvent: false });
      }
      if(value && value.toString().length === 10) {
        this.form.controls['phone'].setErrors(null);
      }
    });

  }

  get passwordMatchError() {
    return (
      this.form.getError('mismatch') &&
      this.form.get('password_confirmation')?.touched
    );
  }

  // Allow only letters and spaces in name field (block numbers/special characters)
  allowOnlyLetters(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowedControlKeys.includes(event.key)) return;
    if (!/^[A-Za-z\s]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizeNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = (input.value || '').replace(/[^A-Za-z\s]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.controls['name'].setValue(sanitized, { emitEvent: false });
    }
  }

  sanitizeNamePaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/[^A-Za-z\s]/.test(pasted)) {
      event.preventDefault();
      const sanitized = pasted.replace(/[^A-Za-z\s]/g, '');
      document.execCommand('insertText', false, sanitized);
    }
  }

  filterEmailCharacters(event: any) {
    const input = event.target;
    const value = input.value;
    // Allow only email-allowed characters: letters, numbers, dot, underscore, hyphen, plus, @
    const filteredValue = value.replace(/[^a-zA-Z0-9._\-+@]/g, '');
    if (value !== filteredValue) {
      input.value = filteredValue;
      this.form.get('email')?.setValue(filteredValue);
    }
  }

  // Allow only digits in phone field (block alphabets/special characters)
  allowOnlyDigits(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    if (allowedControlKeys.includes(event.key)) return;
    // Allow Ctrl/Cmd combinations (copy, paste, select all)
    if (event.ctrlKey || event.metaKey) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizePhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = (input.value || '').replace(/\D/g, '').slice(0, 10);
    if (digitsOnly !== input.value) {
      input.value = digitsOnly;
      this.form.controls['phone'].setValue(digitsOnly, { emitEvent: false });
    }
  }

  sanitizePhonePaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/\D/.test(pasted)) {
      event.preventDefault();
      const sanitized = pasted.replace(/\D/g, '').slice(0, 10);
      document.execCommand('insertText', false, sanitized);
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.tnc.invalid){
      return;
    }
    if(this.form.valid) {
      this.store.dispatch(new Register(this.form.value)).subscribe({
        complete: () => {
          this.registeredEmail = this.form.value.email;
          this.showOtpOverlay = true;
        }
      });
    }
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '').slice(0, 6);
    this.otpValue = sanitized;
    input.value = sanitized;
  }

  get otpComplete(): boolean {
    return this.otpValue.trim().length === 6;
  }

  submitOtp(): void {
    if (!this.otpComplete || this.otpLoading) return;
    this.otpLoading = true;
    this.otpError = '';
    this.store.dispatch(new VerifyRegistrationOtp({
      email: this.registeredEmail,
      otp: this.otpValue.trim()
    })).subscribe({
      complete: () => {
        this.otpLoading = false;
        this.router.navigateByUrl('/auth/login');
      },
      error: (err: any) => {
        this.otpLoading = false;
        this.otpError = err?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  resendOtp(): void {
    this.otpValue = '';
    this.otpError = '';
    this.notificationService.showSuccess('Verification code resent to your email.');
  }
}
