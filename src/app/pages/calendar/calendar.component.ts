import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CalendarEvent } from '../../models/calendar-event.model';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
  imports: [],
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllCalendarEvents().subscribe({
      next: (data) => {
        this.events = data;
        console.log('Événements chargés :', this.events);
      },
      error: (err) => console.error('Erreur de récupération :', err),
    });
  }
}
