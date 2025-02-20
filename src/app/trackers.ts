export interface Trackers {
    id: number,
    id_device: number,
    last_activity: string | null,
    name: string,
    stationName: string,
}

export type OmitedTrackers = Omit<Trackers, 'last_activity' | 'name' | 'stationName' | 'id'>;