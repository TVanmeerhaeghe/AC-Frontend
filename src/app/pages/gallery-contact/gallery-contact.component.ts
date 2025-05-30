import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/products.model';
import { environment } from '../../../environments/environments';

declare const grecaptcha: any;

@Component({
  selector: 'app-gallery-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gallery-contact.component.html',
  styleUrls: ['./gallery-contact.component.scss'],
})
export class GalleryContactComponent implements OnInit {
  form!: FormGroup;
  products: Product[] = [];
  submitting = false;
  success = false;
  errorMsg: string | null = null;
  private siteKey = environment.recaptchaSiteKey;

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      product_id: [null],
      website: [''],
      recaptchaToken: [''],
    });

    this.api.getAllProducts().subscribe({
      next: (prods) => (this.products = prods),
      error: () => (this.products = []),
    });
  }

  onSubmit() {
    const controls = [
      'name',
      'surname',
      'email',
      'phone',
      'subject',
      'message',
    ];
    const invalid = controls.some((key) => this.form.get(key)!.invalid);
    if (invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMsg = null;

    if (typeof grecaptcha === 'undefined') {
      this.errorMsg = 'Impossible de charger ReCAPTCHA';
      this.submitting = false;
      return;
    }

    grecaptcha.ready(() => {
      grecaptcha
        .execute(this.siteKey, { action: 'contact' })
        .then((token: string) => {
          this.form.get('recaptchaToken')!.setValue(token);

          this.api.createContact(this.form.value).subscribe({
            next: () => {
              this.success = true;
              this.form.reset();
              this.submitting = false;
            },
            error: (err) => {
              this.errorMsg = err.error?.message || 'Erreur serveur';
              this.submitting = false;
            },
          });
        })
        .catch(() => {
          this.errorMsg = 'Échec du captcha';
          this.submitting = false;
        });
    });
  }
}
