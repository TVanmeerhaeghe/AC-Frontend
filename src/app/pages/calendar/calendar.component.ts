import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CalendarEvent } from '../../models/calendar-event.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  selectedDate: Date | null = null;
  formData: Partial<CalendarEvent> = {};
  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.loadEvents();
  }
  

  loadEvents(): void {
    this.apiService.getAllCalendarEvents().subscribe({
      next: (data) => {
        this.events = data;
        console.log('Événements chargés :', this.events);
      },
      error: (err) => console.error('Erreur de récupération :', err),
    });
  }

  onSubmit(): void {
    if (!this.formData.start_date || !this.formData.end_date) return;
  
    const start = new Date(this.formData.start_date);
    const end = new Date(this.formData.end_date);
  
    if (start >= end) {
      console.error('La date de fin doit être postérieure à la date de début.');
      return;
    }
  
    const payload: Partial<CalendarEvent> = {
      ...this.formData,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
  
    if (this.formData.id) {
      this.apiService.updateCalendarEvent(this.formData.id, payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm();
        },
        error: (err) => console.error('Erreur de mise à jour :', err),
      });
    } else {
      this.apiService.createCalendarEvent(payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm();
        },
        error: (err) => console.error('Erreur de création :', err),
      });
    }
  }
  
  onDateChange(date: Date | null): void {
    if (!date) return;

    if (!this.selectedRange.start) {
      this.selectedRange.start = date;
      this.selectedRange.end = null;
    } else if (!this.selectedRange.end) {
      if (date < this.selectedRange.start) {
        console.error('La date de fin doit être postérieure ou égale à la date de début.');
        this.selectedRange.start = date;
        this.selectedRange.end = null;
      } else {
        this.selectedRange.end = date;
        this.updateFormDataWithRange();
      }
    } else {
      this.selectedRange = { start: date, end: null };
    }
  }

  updateFormDataWithRange(): void {
    if (this.selectedRange.start && this.selectedRange.end) {
      this.formData.start_date = this.selectedRange.start.toISOString();
      this.formData.end_date = this.selectedRange.end.toISOString();
    }
  }

  dateClass = (date: Date): string => {
    if (this.selectedRange.start && this.selectedRange.end) {
      const start = this.selectedRange.start;
      const end = this.selectedRange.end;
      return date >= start && date <= end ? 'selected-range' : '';
    }
    return '';
  };

  onDelete(): void {
    if (!this.formData.id) return;
    this.apiService.deleteCalendarEvent(this.formData.id).subscribe({
      next: () => {
        this.loadEvents();
        this.resetForm();
      },
      error: (err) => console.error('Erreur de suppression :', err),
    });
  }
  
  
  resetForm(): void {
    this.formData = {};
  }
}
