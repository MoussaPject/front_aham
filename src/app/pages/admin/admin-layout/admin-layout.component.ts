import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageHelper } from '../../../utils/image-helper';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: any;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isProfileMenuOpen = false;
  }

  get userInitial(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name.charAt(0).toUpperCase();
    }
    return 'A';
  }

  get userImageUrl(): string | null {
    if (this.currentUser?.image) {
      return ImageHelper.getStorageUrl(this.currentUser.image);
    }
    return null;
  }
}
