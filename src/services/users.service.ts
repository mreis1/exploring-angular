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
      // console.log(this.filename());
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
      ).subscribe();
  }

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ filename: string }>('/api/upload', formData).pipe(
        tap((response) => {
          console.log('Upload response:', response);
          // this.filename.set(response.filename);
        }),
        map((response) => response.filename),
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('File upload failed'));
        })
      )
  }

  uploadToDatabase(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.http.post<{ image2: string }>('/api/upload-blob', { image2: base64String },
          { headers: {'Content-Type': 'application/json'} }
        ).subscribe({
          next: (response) => observer.next(response.image2),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      reader.onerror = error => observer.error(error);
    });
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
            this.router.navigateByUrl('/home');
          });
      });
    } catch (error) {
      this.showMessage();
      console.error(error);
    }
  }

  getUsers(): void {
    if (this.usersSignal()?.length) {
      return;
    }
    this.http
      .get<User[]>('/api/users')
      .subscribe((users) => this.usersSignal.set(users));
  }

  addUser(formValue: any): void {
    try {
      this.http
      .get<{ csrfToken: string }>('api/csrf-token', { withCredentials: true })
      .subscribe((csrfResponse) => {
        this.http.post<{message: string, user: User}>(
          '/api/register',
          { user: formValue },
          {
            headers: { 'X-CSRF-Token': csrfResponse.csrfToken },
            withCredentials: true,
          }
        ).subscribe((response) => {
          console.log(response);
          this.usersSignal.update((users) => [...users, response.user]);
        })
      })
    } catch (error) {
      this.showMessage();
      console.error(error);
    }
  }

  removeUser(id: number): void {
    try {
      this.http.get<{ csrfToken: string }>('api/csrf-token', { withCredentials: true })
      .subscribe((csrfResponse) => {
        this.http.delete<{message: string}>(
          `/api/users/${id}`,
          {
            headers: { 'X-CSRF-Token': csrfResponse.csrfToken },
            withCredentials: true,
          }
        ).subscribe((response) => {
          console.log("User deleted", response);
          this.usersSignal.update(users => users.filter(user => user.id !== id));
        })
      })
    } catch (error: any) {
      if (error.status === 403) {
        this.snackBar.open("This user has an active login, so it can't be deleted."), { duration: 3000 };
      } else {
        console.error(error);
        this.showMessage();
      }
    }  
  }

  filterMenUsers(): User[] {
    return this.maleUsers();
  }

  filterWomenUsers(): User[] {
    return this.femaleUsers();
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
}
