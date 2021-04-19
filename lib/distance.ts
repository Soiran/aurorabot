const R = 6371000;

const toRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
}

export default function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    let dLat = toRadians(lat2 - lat1);
    let dLon = toRadians(lon2 - lon1);
    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);
    let a = Math.sin(dLat / 2) * Math.sin(dLat/  2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
}