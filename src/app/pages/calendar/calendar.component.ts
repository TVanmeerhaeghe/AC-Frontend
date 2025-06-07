import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CalendarEvent } from '../../models/calendar-event.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    ConfirmPopupComponent
  ],
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  selectedDate: Date | null = null;
  formData: Partial<CalendarEvent> = {};
  selectedRange: { start: Date | null; end: Date | null } = { start: null, end: null };

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.loadEvents();
  }
  

  loadEvents(): void {
    this.apiService.getAllCalendarEvents().subscribe({
      next: (data) => {
        this.events = data;
        console.log('Événements chargés :', this.events);
        if (this.selectedDate) {
          this.filterEventsByDate(this.selectedDate);
        }
      },
      error: (err) => console.error('Erreur de récupération :', err),
    });
  }

  onSubmit(): void {
    console.log('FormData:', this.formData);
    console.log('Start Date:', this.formData.start_date);
    console.log('End Date:', this.formData.end_date);
    console.log('Start Time:', this.formData.start_time);
    console.log('End Time:', this.formData.end_time);

    if (!this.formData.start_date || !this.formData.end_date || !this.formData.start_time || !this.formData.end_time) {
      console.error('Les dates et heures de début et de fin sont obligatoires.');
      return;
    }
    const startDateString = typeof this.formData.start_date === 'string'
      ? this.formData.start_date
      : (this.formData.start_date as Date).toISOString().split('T')[0];

    const endDateString = typeof this.formData.end_date === 'string'
      ? this.formData.end_date
      : (this.formData.end_date as Date).toISOString().split('T')[0];

    const startDateTime = new Date(`${startDateString}T${this.formData.start_time}`);
    const endDateTime = new Date(`${endDateString}T${this.formData.end_time}`);

    console.log('Start DateTime:', startDateTime);
    console.log('End DateTime:', endDateTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.error('Les dates ou heures fournies sont invalides.');
      return;
    }

    if (startDateTime >= endDateTime) {
      console.error('L\'heure de fin doit être postérieure à l\'heure de début.');
      return;
    }

    const payload: Partial<CalendarEvent> = {
      ...this.formData,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
    };

    if (this.formData.id) {
      this.apiService.updateCalendarEvent(this.formData.id, payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm();
          this.snackBar.open('Événement mis à jour avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur de mise à jour :', err);
          this.snackBar.open('Erreur lors de la mise à jour de l\'événement', 'Fermer', { duration: 3000 });
        },
      });
    } else {
      this.apiService.createCalendarEvent(payload).subscribe({
        next: () => {
          this.loadEvents();
          this.resetForm();
          this.snackBar.open('Événement créé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur de création :', err);
          this.snackBar.open('Erreur lors de la création de l\'événement', 'Fermer', { duration: 3000 });
        },
      });
    }
  }
  
  onDateChange(date: Date | null): void {
    this.selectedDate = date;
    if (date) {
      this.filterEventsByDate(date);
    } else {
      this.filteredEvents = [];
    }
  }

  filterEventsByDate(date: Date): void {
    const selectedDateString = date.toISOString().split('T')[0];
    this.filteredEvents = this.events.filter(event => {
      const eventStartDate = new Date(event.start_date).toISOString().split('T')[0];
      const eventEndDate = new Date(event.end_date).toISOString().split('T')[0];

      return selectedDateString >= eventStartDate && selectedDateString <= eventEndDate;
    });
  }

  onEventSelect(event: CalendarEvent): void {
    const startDateTime = new Date(event.start_date);
    const endDateTime = new Date(event.end_date);

    this.formData = {
      ...event,
      start_date: startDateTime.toISOString().split('T')[0], // Date au format YYYY-MM-DD
      end_date: endDateTime.toISOString().split('T')[0],     // Date au format YYYY-MM-DD
      start_time: startDateTime.toTimeString().split(' ')[0], // Heure au format HH:mm:ss
      end_time: endDateTime.toTimeString().split(' ')[0],     // Heure au format HH:mm:ss
    };
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

  resetForm(): void {
    this.formData = {
      start_date: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : undefined,
      end_date: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : undefined,
      start_time: '',
      end_time: '',
      name: '',
      description: '',
      localisation: '',
    };
    this.selectedRange = { start: null, end: null };
  }

  askDeleteEvent(): void {
    if (!this.formData.id) return;
    this.confirmTitle = `Supprimer l'événement <span class="popup-highlight">${this.formData.name}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.apiService.deleteCalendarEvent(this.formData.id!).subscribe({
        next: () => {
          this.events = this.events.filter(event => event.id !== this.formData.id);
          this.filterEventsByDate(this.selectedDate!);
          this.resetForm();
          this.snackBar.open('Événement supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur de suppression :', err);
          this.snackBar.open('Erreur lors de la suppression de l\'événement', 'Fermer', { duration: 3000 });
        },
      });
    };
    this.showConfirm = true;
  }

  onConfirmPopup() {
    if (this.confirmAction) this.confirmAction();
    this.showConfirm = false;
  }
  onCancelPopup() {
    this.showConfirm = false;
  }

  calculateDuration(): number {
    if (!this.formData.start_date || !this.formData.end_date || !this.formData.start_time || !this.formData.end_time) {
      return 0;
    }

    const startDateTime = new Date(`${this.formData.start_date}T${this.formData.start_time}`);
    const endDateTime = new Date(`${this.formData.end_date}T${this.formData.end_time}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return 0;
    }

    const durationInMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    return durationInMilliseconds / (1000 * 60 * 60);
  }

  calculateEventDuration(event: CalendarEvent): number {
    const startDateTime = new Date(event.start_date);
    const endDateTime = new Date(event.end_date);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return 0;
    }

    const durationInMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    return durationInMilliseconds / (1000 * 60 * 60);
  }
}
