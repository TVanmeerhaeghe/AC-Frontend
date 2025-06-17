import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    NgxChartsModule,
  ],
})
export class HomePageComponent implements OnInit {
  recetteTab: 'week' | 'month' | 'year' = 'week';
  recetteTotal = 0;
  calendarDate: Date = new Date();
  upcomingEvents: any[] = [];
  chartData: any[] = [];
  colorScheme = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#007AFF']
  };

  constructor(private router: Router, private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadRecette();
    this.loadUpcomingEvents();
  }

  goToCreate(type: 'client' | 'facture' | 'devis' | 'produit') {
    switch (type) {
      case 'client':
        this.router.navigate(['/dashboard/customers'], { queryParams: { create: 1 } });
        break;
      case 'facture':
        this.router.navigate(['/dashboard/invoices'], { queryParams: { create: 1 } });
        break;
      case 'devis':
        this.router.navigate(['/dashboard/estimates'], { queryParams: { create: 1 } });
        break;
      case 'produit':
        this.router.navigate(['/dashboard/product'], { queryParams: { create: 1 } });
        break;
    }
  }

  loadRecette() {
    Promise.all([
      this.api.getPaidInvoiceRevenue().toPromise(),
      this.api.getSoldProductRevenue().toPromise()
    ]).then(([invoices, products]) => {
      const now = new Date();
      let start: Date, end: Date;

      if (this.recetteTab === 'week') {
        const day = now.getDay() || 7;
        start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        end = new Date(now);
      } else if (this.recetteTab === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
      }

      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const sumRevenue = (data: any[], label: string) => {
        let filtered: any[] = [];
        if (this.recetteTab === 'week') {
          const now = new Date();
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setHours(0,0,0,0);
          firstDayOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          lastDayOfWeek.setHours(23,59,59,999);

          filtered = data.filter(item => {
            const [year, month, day] = item.period.split('-').map(Number);
            const periodDate = new Date(year, month - 1, day);
            return periodDate >= firstDayOfWeek && periodDate <= lastDayOfWeek;
          });
        } else if (this.recetteTab === 'month') {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          filtered = data.filter(item => {
            const [y, m] = item.period.split('-').map(Number);
            return y === year && m === month;
          });
        } else {
          const year = new Date().getFullYear();
          filtered = data.filter(item => {
            const [y] = item.period.split('-').map(Number);
            return y === year;
          });
        }
        return filtered.reduce((sum, item) => sum + (item.total || 0), 0);
      };

      this.recetteTotal =
        sumRevenue(invoices ?? [], 'invoices') +
        sumRevenue(products ?? [], 'products');

      this.updateChartData(invoices ?? [], products ?? []);
    });
  }

  private updateChartData(invoices: any[], products: any[]) {
    const map = new Map<string, number>();
    const add = (arr: any[]) => arr.forEach(item => {
      map.set(item.period, (map.get(item.period) || 0) + (item.total || 0));
    });
    add(invoices);
    add(products);

    if (this.recetteTab === 'week') {
      const now = new Date();
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      this.chartData = Array.from({length: 7}).map((_, i) => {
        const d = new Date(firstDay);
        d.setDate(firstDay.getDate() + i);
        const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        const key = d.toISOString().slice(0,10);
        return { name: label, value: map.get(key) || 0 };
      });
    } else if (this.recetteTab === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const weeks = [0, 0, 0, 0];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const weekIndex = Math.floor((d - 1) / (daysInMonth / 4));
        const key = date.toISOString().slice(0, 10);
        weeks[weekIndex] += map.get(key) || 0;
      }
      this.chartData = weeks.map((v, i) => ({ name: `S${i + 1}`, value: v || 0 }));
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const months = Array.from({length: 12}, (_, i) => {
        const label = new Date(year, i, 1).toLocaleString('fr-FR', { month: 'short' });
        let sum = 0;
        for (let d = 1; d <= 31; d++) {
          const date = new Date(year, i, d);
          if (date.getMonth() !== i) break;
          sum += map.get(date.toISOString().slice(0,10)) || 0;
        }
        return { name: label, value: sum };
      });
      this.chartData = months;
    }
  }

  loadUpcomingEvents() {
    this.api.getAllCalendarEvents().subscribe({
      next: (events) => {
        const now = new Date();
        this.upcomingEvents = events
          .filter(e => new Date(e.start_date) >= now)
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 5);
      }
    });
  }
}
