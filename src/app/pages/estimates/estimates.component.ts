import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-estimates',
  imports: [],
  templateUrl: './estimates.component.html',
  styleUrl: './estimates.component.scss'
})
export class EstimatesComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['create'] === '1') {
        console.log('Paramètre create=1 détecté (formulaire à ouvrir ici)');
      }
    });
  }
}
