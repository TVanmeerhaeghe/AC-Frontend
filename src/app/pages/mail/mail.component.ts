import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Contact } from '../../models/contact.model';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [CommonModule, ConfirmPopupComponent],
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact?: Contact;
  productImageUrl?: string;
  loading = true;

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    this.api.getAllContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    this.productImageUrl = undefined;
    if (contact.product_id) {
      this.api.getProductById(contact.product_id).subscribe(prod => {
        this.productImageUrl = prod.imageUrl;
      });
    }
  }

  askDeleteContact(contact: Contact) {
    this.confirmTitle = `Supprimer le contact <span class="popup-highlight">${contact.name} ${contact.surname}</span> ?`;
    this.confirmMessage = `Cette action est définitive, vous pourrez néanmoins le créer de nouveau par la suite.`;
    this.confirmAction = () => {
      this.api.deleteContact(contact.id).subscribe({
        next: () => {
          this.contacts = this.contacts.filter(c => c.id !== contact.id);
          if (this.selectedContact?.id === contact.id) this.selectedContact = undefined;
          this.snackBar.open('Contact supprimé avec succès', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors de la suppression du contact', 'Fermer', { duration: 3000 });
        }
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

  encode(val: string): string {
    return encodeURIComponent(val);
  }
}
