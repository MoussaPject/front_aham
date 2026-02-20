import { Component, Input } from '@angular/core';
import { Produit } from '../../models/produit';

@Component({
  selector: 'app-card-produit',
  templateUrl: './card-produit.component.html',
  styleUrls: ['./card-produit.component.css']
})
export class CardProduitComponent {
  @Input() produit!: Produit;
}
