import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../models/users.model';
import { ConfirmPopupComponent } from '../../shared/confirm-popup/confirm-popup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [CommonModule, ConfirmPopupComponent],
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {
  user?: User;
  loadingUser = true;
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadingUser = true;
    // Récupère l'utilisateur courant depuis le localStorage (clé à adapter si besoin)
    const userId = Number(localStorage.getItem('userId'));
    if (userId && !isNaN(userId)) {
      this.api.getUser(userId).subscribe({
        next: user => {
          this.user = user;
          this.loadingUser = false;
        },
        error: () => {
          this.user = undefined;
          this.loadingUser = false;
        }
      });
    } else {
      this.user = undefined;
      this.loadingUser = false;
    }
  }

  askDeleteAccount() {
    this.confirmTitle = 'Supprimer mon compte ?';
    this.confirmMessage = 'Cette action est définitive et supprimera toutes vos données.';
    this.confirmAction = () => {
      if (this.user?.id) {
        this.api.deleteUser(this.user.id).subscribe({
          next: () => {
            this.snackBar.open('Compte supprimé avec succès', 'Fermer', { duration: 3000 });
            // Rediriger ou déconnecter l'utilisateur ici si besoin
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression du compte', 'Fermer', { duration: 3000 });
          }
        });
      }
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
}
