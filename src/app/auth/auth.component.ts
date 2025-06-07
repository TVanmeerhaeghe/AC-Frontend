import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  signupForm!: FormGroup;
  signinForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email_adress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['client']
    });

    this.signinForm = this.fb.group({
      email_adress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSignUp() {
    if (this.signupForm.valid) {
      this.userService.signUp(this.signupForm.value).subscribe({
        next: res => console.log('✅ Inscription réussie', res),
        error: err => console.error('❌ Erreur signup', err)
      });
    }
  }

  onSignIn() {
    if (this.signinForm.valid) {
      this.userService.signIn(this.signinForm.value).subscribe({
        next: res => {
          this.authService.setToken(res.token);
          console.log('✅ Connexion réussie', res);
        },
        error: err => console.error('❌ Erreur signin', err)
      });
    }
  }
}
