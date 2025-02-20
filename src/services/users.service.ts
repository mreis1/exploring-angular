import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { User } from '../app/user';
import { BehaviorSubject, catchError, Observable, tap, of, map, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { response } from 'express';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  //private socket: Socket;
  http = inject(HttpClient);
  router = inject(Router);

  //users = new BehaviorSubject<Users[]>([]);
  //users$ = this.users.asObservable();
  usersSignal = signal<User[]>([]);

  currentUserSignal = signal<User | undefined | null>(undefined);
  isLogged = computed(() => this.currentUserSignal());

  filename = signal<string | undefined | null>(null);

  maleUsers = computed(() =>
    this.usersSignal().filter((user) => user.gender.toLowerCase() === 'male')
  );
  femaleUsers = computed(() =>
    this.usersSignal().filter((user) => user.gender.toLowerCase() === 'female')
  );

  constructor(private snackBar: MatSnackBar) {
    effect(() => {
      console.log(this.usersSignal());
      console.log(this.filename());
    });
  }

  getCurrentUser() {
    return this.http
      .get<{ user: User }>('/api/check', { withCredentials: true })
      .pipe(
        tap((response) => {
          console.log('Session', response.user);
          this.currentUserSignal.set(response.user);
        }),
        catchError((error) => {
          console.log('No session', error);
          this.currentUserSignal.set(null);
          return of(null);
        })
      );
  }

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ filename: string }>('/api/upload', formData).pipe(
        tap((response) => {
          console.log('Upload response:', response);
          this.filename.set(response.filename);
        }),
        map((response) => response.filename),
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('File upload failed'));
        })
      )
  }

  register(formValue: any): void {
    try {
       this.http
      .get<{ csrfToken: string }>('api/csrf-token', { withCredentials: true })
      .subscribe((csrfResponse) => {
        this.http
          .post<{ message: string; user: User }>(
            '/api/register',
            { user: formValue },
            {
              headers: { 'X-CSRF-Token': csrfResponse.csrfToken },
              withCredentials: true,
            }
          )
          .subscribe((response) => {
            console.log(response);
            this.currentUserSignal.set(response.user);
            setTimeout(() => {
              this.router.navigateByUrl('/home');
            }, 100);  
          });
      });
    } catch (error) {
      this.showMessage();
      console.error(error);
    }  
  }

  getUsers(): void {
    this.http
      .get<User[]>('/api/users')
      .subscribe((users) => this.usersSignal.set(users));
  }

  showMessage(): void {
    this.snackBar.open("Something went wrong. Please check your connection and try again later."), { duration: 3000 };
  }

  //addUser(data: {gender: string, name: string, birthDate: string}): Observable<Users> {
  //  const newUser: Users = {
  //    gender: data.gender,
  //    name: data.name,
  //    birthDate: data.birthDate,
  //    id: Math.random().toString(16)
  //  }
  //  const currentUsers = this.users.getValue();
  //  const updatedUsers = [...currentUsers, newUser];
  //  this.users.next(updatedUsers);
  //
  //  return new Observable((observer) => {
  //    observer.next(newUser);
  //    observer.complete();
  //  })
  //}
  //
  //removeUser(id: string): Observable<Users | null> {
  //  const currentUsers = this.users.getValue();
  //  if (currentUsers.length === 0) {
  //    this.snackBar.open('There are no users to remove', '', { duration: 2000 });
  //    return new Observable((observer) => {
  //      observer.next(null);
  //      observer.complete();
  //    });
  //  }
  //
  //  const userToRemove = currentUsers.find((user) => user.id === id);
  //  if (!userToRemove) {
  //    this.snackBar.open('User not found', '', { duration: 2000 });
  //    return new Observable((observer) => {
  //      observer.next(null);
  //      observer.complete();
  //    });
  //  }
  //
  //  const updatedUsers = currentUsers.filter((user) => user.id !== id);
  //  this.users.next(updatedUsers);
  //
  //  return new Observable((observer) => {
  //    observer.next(userToRemove);
  //    observer.complete();
  //  });
  //}
  //
  //filterMenUsers(): Observable<Users[]> {
  //  return this.users$.pipe(
  //    map((users) => users.filter((user) => user.gender.toLowerCase() === 'male'))
  //  );
  //}
  //
  //filterWomenUsers(): Observable<Users[]> {
  //  return this.users$.pipe(
  //    map((users) => users.filter((user) => user.gender.toLowerCase() === 'female'))
  //  );
  //}
  //
  //getAllUsers(): Observable<Users[]> {
  //  return this.users$;
  //}

  addUser(data: {
    email: string;
    password: string;
    gender: string;
    name: string;
    birthDate: string;
    image: string;
  }): void {
    const newUser: User = {
      id: Math.random(),
      email: data.email,
      password: data.password,
      gender: data.gender,
      name: data.name,
      birthDate: data.birthDate,
      image: data.image,
    };
    this.usersSignal.update((currentUsers) => [...currentUsers, newUser]);
    this.snackBar.open(`User ${newUser.name} added successfully`, '', {
      duration: 2000,
    });
  }

  removeUser(id: number): void {
    let removedUser: User | null = null;
    this.usersSignal.update((currentUsers) => {
      const userToRemove = currentUsers.find((user) => user.id === id);
      if (!userToRemove) {
        this.snackBar.open('User not found', '', { duration: 2000 });
        return currentUsers;
      }
      removedUser = userToRemove;
      return currentUsers.filter((user) => user.id !== id);
    });
    if (removedUser) {
      this.snackBar.open(`User removed successfully`, '', { duration: 2000 });
    } else if (this.usersSignal().length === 0) {
      this.snackBar.open('There are no users to remove', '', {
        duration: 2000,
      });
    }
  }

  filterMenUsers(): User[] {
    return this.maleUsers();
  }

  filterWomenUsers(): User[] {
    return this.femaleUsers();
  }
}
