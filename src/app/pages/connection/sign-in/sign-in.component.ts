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
  templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnInit {
  form!: FormGroup;

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
  }
  

  submit() {
    if (this.form.valid) {
      this.apiService.signIn(this.form.value).subscribe({
        next: res => {
          this.authService.setToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error: err => console.error('❌ Erreur', err)
      });
    }
  }
  
}
