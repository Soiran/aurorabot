import User from '../controllers/user.controller';

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
    latitude: number | null,
    longitude: number | null,
    city_latitude: number,
    city_longitude: number,
    photo_id: string,
    likes: number,
    reports: number,
    gender: number,
    relationships: boolean,
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
    relationships: boolean,
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
    city_latitude?: number,
    city_longitude?: number,
    photo_id?: string,
    likes?: number,
    reports?: number,
    gender?: number,
    relationships?: boolean,
    search_gender?: number,
    search_mode?: number
};

export type City = {
    exists: boolean,
    name?: string,
    latitude?: number,
    longitude?: number
}

export enum Response {
    VALID,
    VALID_CITY,
    VALID_LOCATION,
    UNKNOWN_LOCATION,
    UNKNOWN_CITY,
    NO_VALUE,
    TOO_LONG,
    TOO_SHORT,
    OUT_OF_RANGE,
    FORBIDDEN_SYMBOLS,
    UNKNOWN,
    NOT_VALID,
    INCORRECT,
    EMPTY
};

export enum Relation {
    STRANGER,
    LIKED,
    MUTUAL
};

export type SearchResult = {
    found: boolean
    relation?: Relation,
    user?: User,
    message?: string
}

export type StorageHeap<T> = {
    [key: string]: T
};

export type ParsedProfileString = {
    name: string,
    age: number,
    city: string,
    description: string
};