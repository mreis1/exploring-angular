import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';
import { Devices } from '../app/devices';
import { Events } from '../app/events';

@Injectable({
    providedIn: 'root',
})

export class SocketService {
    private socket?: Socket;
    platformId = inject(PLATFORM_ID);

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
    }

    getDevices(callback: (data: any) => void): void {
        this.socket?.emit("get-devices", {}, callback);
    }

    getEvents(callback: (data: any) => void): void {
        this.socket?.emit("get-events", {}, callback);
    }

    getTrackers(callback: (data: any) => void): void {
        this.socket?.emit("get-trackers", {}, callback);
    }

    createDevice(device: Devices, callback: (data: any) => void): void {
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