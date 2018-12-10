import { KxChange } from './change';

export type KxListener<T = any> = (state: T, change: KxChange) => any;
