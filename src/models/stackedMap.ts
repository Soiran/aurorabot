import Logger from '../../lib/cl';
import { StackedMapHeap } from '../typings/global';


export default class StackedMap<T> {
    public logger: Logger;
    public heap: StackedMapHeap<T>

    
    constructor(heap?: StackedMapHeap<T>) {
        this.heap = heap || {} as StackedMapHeap<T>;
        this.logger = new Logger('StackedMapModel');
    }

    public get size() {
        return Object.keys(this.heap).length;
    }

    public get last() {
        return this.heap[Object.keys(this.heap).reverse()[0]];
    }

    public pop() {
        let temp = this.heap[Object.keys(this.heap).reverse()[0]];
        delete this.heap[Object.keys(this.heap).reverse()[0]];
        return temp;
    }

    public wipe() {
        this.heap = {} as StackedMapHeap<T>;
    }

    public set(key: string | number, value: T) {
        this.heap[typeof key === 'string' ? key : key + ''] = value;
    }

    public delete(key: string | number) {
        delete this.heap[typeof key === 'string' ? key : key + ''];
    }

    public has(key: string | number): boolean {
        return !!this.heap[typeof key === 'string' ? key : key + ''];
    }

    public get(key: string | number): T {
        return this.heap[typeof key === 'string' ? key : key + ''];
    }

    public select(conditionCallback: (value: T) => boolean) {
        return Object.values(this.heap).filter((value: T) => conditionCallback(value));
    }
}
