export type Profile = {
    id: number,
    created: number,
    last_edit: number,
    last_active: number,
    status: number,
    anonymous: boolean,
    rank: number,
    name: string,
    age: number,
    tags: string[],
    description: string,
    city: string,
    latitude: number,
    longitude: number,
    photo_id: string,
    likes: number,
    reports: number,
    gender: number,
    search_gender: number,
    search_mode: number
};

export type ProfileRender = {
    id: number,
    created: number,
    last_edit: number,
    last_active: number,
    anonymous: boolean,
    name: string,
    age: number,
    tags: string[],
    description: string,
    city: string,
    photo_id: string,
    likes: number,
    reports: number,
    gender: number,
    search_gender: number,
    search_mode: number
};

export type ProfileUpdate = {
    last_edit?: number,
    last_active?: number,
    status?: number,
    anonymous?: boolean,
    rank?: number,
    name?: string,
    age?: number,
    tags?: string[],
    description?: string,
    city?: string,
    latitude?: number,
    longitude?: number,
    photo_id?: string,
    likes?: number,
    reports?: number,
    gender?: number,
    search_gender?: number,
    search_mode?: number
};

export type City = {
    exists: boolean,
    name?: string,
    latitude?: number,
    longitude?: number
}