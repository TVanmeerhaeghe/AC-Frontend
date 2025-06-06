import { Component, NgZone, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UserMenuComponent } from '../../../navigation/user-menu/user-menu.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserMenuComponent],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  showForgotForm = false;
  forgotForm!: FormGroup;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    this.form = this.fb.group({
      email_adress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  

  submit() {
    if (this.form.valid) {
      this.apiService.signIn(this.form.value).subscribe({
        next: (res) => {
          this.errorMessage = '';
          this.authService.setToken(res.token);
          this.zone.run(() => this.router.navigate(['/dashboard']));
        },
        error: (err) => {
          if (err.status === 401) {
            this.errorMessage = 'Identifiant ou mot de passe incorrect.';
          } else {
            this.errorMessage = 'Erreur lors de la connexion.';
          }
        }
      });
    }
  }

  sendForgotMail() {
    if (this.forgotForm.valid) {
      this.apiService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: () => {
          alert('Un mail de réinitialisation a été envoyé si l\'adresse existe.');
          this.showForgotForm = false;
          this.forgotForm.reset();
        },
        error: () => alert('Erreur lors de l\'envoi du mail.')
      });
    }
  }
  
}
