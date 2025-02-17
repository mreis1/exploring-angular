import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userService = inject(UserService);
  router = inject(Router);
  http = inject(HttpClient);

  activeLink: string = 'home';

  setActive(link: string): void {
    this.activeLink = link;
  }

  onLogout(): void {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe(() => {
      this.userService.currentUserSignal.set(null);
      this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
        this.router.navigate([this.router.url]);
      })
    }); 
  }
}
