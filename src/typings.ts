export interface Config {
    id: number,
    city: string,
    latitude: number,
    longitude: number,
    radius: number,
    tags: string[]
};

export interface Form {
    id: number,
    name: string,
    age: number,
    photoid: number[],
    tags: string[],
    description: string,
    city: string,
    latitude: number,
    longitude: number,
    likes: number,
    gender: string
};