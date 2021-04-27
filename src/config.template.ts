// ! Rename config.template.ts to config.ts for deploy


export const VKAPI = {
    TOKEN: null // string
};

export const DB = {
    USER: null, // string
    PASSWORD: null, // string
    IP_ADRESS: null, // string
    PORT: null // string
}

export const USER = {
    MUTUAL_WIPING_INTERVAL: null, // number
    VIEWED_WIPING_INTERVAL: null, // number
    LIKED_WIPING_INTERVAL: null, // number
    REPORTS_WIPING_INTERVAL: null, // number
    REPORTED_WIPING_INTERVAL:  null, // number
    LIKES_LIMIT: null, // number
    REPORTS_LIMIT: null, // number
    REPORTED_LIMIT: null // number
};

export const DEV =  {
    admins: null // number[]
}