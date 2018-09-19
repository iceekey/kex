import { KxResolvedModifier } from './resolved-modifier';

export type KxModifier<T> = IterableIterator<KxResolvedModifier<T> | Promise<KxResolvedModifier<T>>>;
