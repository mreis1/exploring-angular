export interface Device {
    id: number;
    name: string,
    stationName: string
}

export type CreateReq = Omit<Device, 'id'>;
