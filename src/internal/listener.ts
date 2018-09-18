import { KxChange } from './change';

export type KxListener = (state: any, change: KxChange) => any;
