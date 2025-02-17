import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Users } from '../app/users';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //private socket: Socket;
  http = inject(HttpClient);
  router = inject(Router);
  
  //users = new BehaviorSubject<Users[]>([]);
  //users$ = this.users.asObservable();
  usersSignal = signal<Users[]>([]);

  currentUserSignal = signal<Users | undefined | null>(undefined);
  isLogged = computed(() => this.currentUserSignal());

  filename = signal<string | undefined | null>(null);

  maleUsers = computed(() => this.usersSignal().filter(user => user.gender.toLowerCase() === 'male'));
  femaleUsers = computed(() => this.usersSignal().filter(user => user.gender.toLowerCase() === 'female'));

  constructor(private snackBar: MatSnackBar) {
  
    effect(() => {
      console.log(this.usersSignal());
      console.log(this.filename());
    })
  }

  getCurrentUser(): void {
    this.http.get('/api/check', { withCredentials: true }).subscribe(
      (response: any) => {
        this.currentUserSignal.set(response.user);
      },  
    )
  }

  upload(file: File): void {
    const formData = new FormData();
    formData.append("file", file);
    this.http.post<{ filename: string }>(
      '/api/upload', 
      formData
    ).subscribe((response) => {
      console.log("Upload response:", response); 
      this.filename.set(response.filename);
      console.log("Filename signal updated to:", this.filename());
    });
  }

  register(formValue: any): void {
    this.http.post<{message: string, user: Users}>(
      '/api/register',
      {
        user: formValue,
      }
    ).subscribe((response) => {
      console.log(response);
      this.currentUserSignal.set(response.user);
      this.router.navigateByUrl('/home');
    })
  }

  getUsers(): void {
    this.http.get<Users[]>('/api/users').subscribe((users) => this.usersSignal.set(users));
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

  addUser(data: {email: string, password: string, gender: string, name: string, birthDate: string, image: string}): void {
    const newUser: Users = {
      id: Math.random(),
      email: data.email,
      password: data.password,
      gender: data.gender,
      name: data.name,
      birthDate: data.birthDate,
      image: data.image
    }
    this.usersSignal.update(currentUsers => [...currentUsers, newUser]);
    this.snackBar.open(`User ${newUser.name} added successfully`, '', { duration: 2000 });
  }

  removeUser(id: number): void {
    let removedUser: Users | null = null;
    this.usersSignal.update(currentUsers => {
      const userToRemove = currentUsers.find(user => user.id === id);
      if (!userToRemove) {
        this.snackBar.open('User not found', '', { duration: 2000 });
        return currentUsers;
      }
      removedUser = userToRemove;
      return currentUsers.filter(user => user.id !== id);
    });
    if (removedUser) {
      this.snackBar.open(`User removed successfully`, '', { duration: 2000 });
    } else if (this.usersSignal().length === 0) {
      this.snackBar.open('There are no users to remove', '', { duration: 2000 });
    }
  }

  filterMenUsers(): Users[] {
    return this.maleUsers();
  }

  filterWomenUsers(): Users[] {
    return this.femaleUsers();
  }

}