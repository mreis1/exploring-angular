import { Component, inject, Signal } from '@angular/core';
import { User } from '../user';
import { UserService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { Mode } from '../mode';


@Component({
  selector: 'app-users',
  imports: [CommonModule, MatListModule, MatButtonModule,
    MatIconModule, MatTooltipModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  userService = inject(UserService);
  users = this.userService.usersSignal;
  femaleUsers = this.userService.femaleUsers;
  maleUsers = this.userService.maleUsers;
  dialoge = inject(MatDialog);
  selectedFilter: Mode = Mode.All;
  currentPage: number = 1;
  usersPerPage: number = 5;

  tableHeaders: string[] = [
    '#',
    'Name',
    'Email',
    'BirthDate',
    'Image',
    'Image2',
    'Action'
  ]

  setFilter(filter: Mode): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
  }

  get filteredUsers(): Signal<User[]> {
    switch (this.selectedFilter) {
      case Mode.Female:
        return this.femaleUsers;
      case Mode.Male:
        return this.maleUsers;
      default:
        return this.users;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get effectiveUserPerPage(): number {
    return window.innerWidth < 640 ? this.filteredUsers().length : this.usersPerPage;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers().length / this.effectiveUserPerPage);
  }

  usersInPage(): User[] {
    const perPage = this.effectiveUserPerPage;
    const startIndex = (this.currentPage - 1) * perPage;
    return this.filteredUsers().slice(startIndex, startIndex + perPage);
  }

  navigateToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onRemoveUser(id: number): void {
    this.userService.removeUser(id);
  }

  openImage(imageUrl: string): void {
    this.dialoge.open(ImageDialogComponent, {
      data: {
        imageUrl: imageUrl
      }
    })
  }
}
