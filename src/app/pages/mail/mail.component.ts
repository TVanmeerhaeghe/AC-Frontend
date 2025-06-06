import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact?: Contact;
  productImageUrl?: string;
  loading = true;

  constructor(private api: ApiService) {}

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

  deleteContact(contact: Contact) {
    if (confirm('Supprimer ce contact ?')) {
      this.api.deleteContact(contact.id).subscribe(() => {
        this.contacts = this.contacts.filter(c => c.id !== contact.id);
        if (this.selectedContact?.id === contact.id) this.selectedContact = undefined;
      });
    }
  }

  encode(val: string): string {
    return encodeURIComponent(val);
  }
}
