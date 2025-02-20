export interface Events {
    id_device: number,
    state: string,
    error_code: string | null,
    id_user: number,
    created_at: string | null
}

export type OmitedEvents = Omit<Events, 'created_at'>;