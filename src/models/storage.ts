import { StorageHeap } from '../typings/global';


export default class Storage<T> {
    public heap: StorageHeap<T>

    
    constructor() {
        this.heap = {} as StorageHeap<T>;
    }


    public push(key: string, value: T) {
        this.heap[key] = value;
    }

    public drop(key: string) {
        delete this.heap[key];
    }

    public exists(key: string): boolean {
        return !!this.heap[key];
    }

    public get(key: string): T {
        return this.heap[key];
    }

    public select(conditionCallback: (value: T) => boolean) {
        return Object.values(this.heap).filter((value: T) => conditionCallback(value));
    }
}
