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
    if (!this.selectedDate) return;

    const start = new Date(this.selectedDate);
    const end = new Date(this.selectedDate);
    end.setHours(start.getHours() + (this.formData.duration_time ?? 1));

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

  onDateChange(date: Date | null): void {
    this.selectedDate = date;
    if (!date) return;
  
    const existingEvent = this.events.find(event => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  
    if (existingEvent) {
      this.formData = { ...existingEvent };
    } else {
      this.formData = {
        name: '',
        description: '',
        localisation: '',
        duration_time: 1,
      };
    }
  }
  
  
  resetForm(): void {
    this.formData = {};
  }
}
