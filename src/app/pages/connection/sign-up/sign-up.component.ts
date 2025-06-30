import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from './../../../services/api.service';
import { UserMenuComponent } from '../../../navigation/user-menu/user-menu.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserMenuComponent],
  
templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;

  constructor(private readonly fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email_adress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['ADMIN']
    });
  }

  submit() {
    if (this.form.valid) {
      const payload = this.form.value as {
        name: string;
        surname: string;
        email_adress: string;
        password: string;
        role: string;
      };

      this.apiService.signUp(payload).subscribe({
        error: (err) => console.error('❌ Erreur :', err)
      });
    }
  }
}
