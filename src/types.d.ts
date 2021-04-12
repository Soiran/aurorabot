export declare type Profile = {
    id: number,
    active: boolean,
    name: string,
    age: number,
    tags: string[],
    description: string,
    city: string,
    latitude: number,
    longitude: number,
    photo: boolean,
    likes: number,
    radius: number,
    gender: number,
    searchGender: number
};

export declare type ProfileRender = {
    name?: string,
    age?: number,
    tags?: string[],
    description?: string,
    city?: string,
    gender?: number
};

export declare type ProfileUpdate = {
    name?: string,
    active?: boolean,
    age?: number,
    tags?: string[],
    description?: string,
    city?: string,
    latitude?: number,
    longitude?: number,
    photo?: boolean,
    radius?: number,
    gender?: number,
    searchGender?: number
};