export interface Devices {
    id: number;
    name: string,
    stationName: string
}

export type CreateReq = Omit<Devices, 'id'>;
