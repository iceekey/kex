import { KxAction } from './action';

export type KxState<T = any> = { actions?: KxAction[]; cache?: object } & Partial<T>;
