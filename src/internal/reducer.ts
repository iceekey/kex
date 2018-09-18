import { KxAction } from './action';
import { KxModifier } from './modifier';

export type KxReducer<T = any> = (action: KxAction) => KxModifier<T>;
