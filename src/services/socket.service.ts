import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import {CreateReq, Devices} from '../app/devices';
import { Events } from '../app/events';

@Injectable({
    providedIn: 'root',
})

export class SocketService {
    private socket?: Socket;
    platformId = inject(PLATFORM_ID);

    devicesSignal = signal<Devices[]>([]);
    eventsSignal = signal<Events[]>([]);
    trackersSignal = signal<any[]>([]);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.socket = io('', {
                transports: ['websocket'],
                path: undefined
            })
        }

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

    createDevice(device: CreateReq, callback: (data: any) => void): void {
        this.socket?.emit("create-device", device, callback);
    }

    createEvent(event: Events, callback: (data: any) => void): void {
        this.socket?.emit("create-event", event, callback);
    }

    createTracker(tracker: { id_device: number }, callback: (data: any) => void): void {
        this.socket?.emit("create-tracker", tracker, callback);
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
}
