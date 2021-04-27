import { TimeoutController } from '../../lib/time';
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

export enum ProfileView {
    STRANGER,
    LIKED,
    MUTUAL,
    REPORT,
    AD
}

export type SearchResult = {
    found: boolean,
    type?: ProfileView,
    controller?: User,
    message?: string
};

export type StackedMapHeap<T> = {
    [key: string]: T
};

export type ParsedProfileString = {
    name: string,
    age: number,
    city: string,
    description: string
};

export type LikedUser = {
    controller: User,
    viewedAfter: 0  
};

export type MutualUser = {
    controller: User,
    wipingController: TimeoutController
};

export type UserNotification = {
    controller: User,
    type: ProfileView,
    message?: string
};

export type TimeSet = {
    ms?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number
};