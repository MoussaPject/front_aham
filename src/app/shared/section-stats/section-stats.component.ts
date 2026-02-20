import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-stats',
  templateUrl: './section-stats.component.html',
})
export class SectionStatsComponent {
  @Input() produits = 0;
  @Input() commandes = 0;
  @Input() clients = 0;
}
