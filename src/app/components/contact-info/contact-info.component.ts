import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.css']
})
export class ContactInfoComponent {

  onSubmit(event: Event) {
    event.preventDefault();
    alert('Merci pour votre message ! Notre équipe vous répondra sous 24h.');
    // Ici tu pourras ajouter l'envoi vers ton API Laravel plus tard
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-image.jpg';
  }
}