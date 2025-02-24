import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import {CreateReq, Device} from '../app/device';
import { Events, OmitedEvents } from '../app/events';
import { OmitedTrackers, Trackers } from '../app/trackers';
import { MatSnackBar } from '@angular/material/snack-bar'

@Injectable({
    providedIn: 'root',
})

export class SocketService {
    private socket?: Socket;
    platformId = inject(PLATFORM_ID);
    snackBar = inject(MatSnackBar);

    devicesSignal = signal<Device[]>([]);
    eventsSignal = signal<Events[]>([]);
    trackersSignal = signal<Trackers[]>([]);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.socket = io('', {
                transports: ['websocket'],
                path: undefined
            })
        }

        console.log('Event',this.eventsSignal);

        this.socket?.on("connection", () => {
            console.log("Connected to the server", this.socket?.id);
        })

        this.socket?.on("disconnect", () => {
            console.log("Disconnected from the server");
        })

        this.socket?.on("device-created", (device) => {
            console.log("Device created", device);
            this.devicesSignal.update(devices => [...devices, device]);
        })

        this.socket?.on("event-created", (event) => {
            console.log("Event created", event);
            this.eventsSignal.update(events => [...events, event]);
        })

        this.socket?.on("tracker-created", (tracker) => {
            console.log("Tracker created", tracker);
            this.trackersSignal.update(trackers => [...trackers, tracker]);
        })

        this.socket?.on("tracker-deleted", (id: number) => {
            console.log("Tracker deleted", id);
            this.trackersSignal.update(trackers => trackers.filter(tracker => tracker.id !== id));
        })
    }

    getDevices(): void {
        this.socket?.emit("get-devices", {}, (data: any) => {
            if (data.success) {
                this.devicesSignal.set(data.devices);
            } else {
                console.error("Error getting devices", data.message);
            }
        })
    }

    getEvents(): void {
        this.socket?.emit("get-events", {}, (data: any) => {
            if (data.success) {
                this.eventsSignal.set(data.events);
            } else {
                console.error("Error getting events", data.message);
            }
        })
    }

    getTrackers(): void {
        this.socket?.emit("get-trackers", {}, (data: any) => {
            if (data.success) {
                this.trackersSignal.set(data.trackers);
            } else {
                console.error("Error getting trackers", data.message);
            }
        })
    }

    createDevice(device: CreateReq, callback: (data: Device) => void): void {
        this.socket?.emit("create-device", device, (data: any) => {
              console.log('create device', data);
            if (data.success) {
                callback(data.device);
            } else {
                this.showMessage();
                console.error("Error creating device", data.message);
            }
        });
    }

    createEvent(event: OmitedEvents, callback: (data: any) => void): void {
        this.socket?.emit("create-event", event, (data: any) => {
            if (data.success) {
                callback(data.event);
            } else {
                this.showMessage();
                console.error("Error creating event", data.message);
            }
        });
    }

    createTracker(tracker: OmitedTrackers, callback: (data: any) => void): void {
        this.socket?.emit("create-tracker", tracker, (data: any) => {
            if (data.success) {
                //this.trackersSignal.update(trackers => [...trackers, data.tracker]);
                callback(data.tracker);
            } else {
                this.showMessage();
                console.error("Error creating tracker", data.message);
            }
        });
    }

    deleteTracker(id: number): void {
        this.socket?.emit("delete-tracker", {id}, (data: any) => {
            if (data.success) {
                this.trackersSignal.update(trackers => trackers.filter(tracker => tracker.id !== id));
            } else {
                this.showMessage();
                console.error("Error deleting tracker", data.message);
            }
        });
    }

    onDeviceCreated() {
        this.socket?.on("device-created", (device) => console.log(device));
    }

    onEventCreated() {
        this.socket?.on("event-created", (event) => console.log(event));
    }

    onTrackerCreated() {
        this.socket?.on("tracker-created", (tracker) => console.log(tracker));
    }

    onTrackerDeleted() {
        this.socket?.on("tracker-deleted", (id) => console.log(id));
    }

    showMessage(): void {
        this.snackBar.open("Something went wrong. Please check your connection and try again later."), { duration: 3000 };
    }
}
