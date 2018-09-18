import { KxResolvedModifier } from './resolved-modifier';

export type KxModifier<T> = Iterable<KxResolvedModifier<T>> | Iterable<Promise<KxResolvedModifier<T>>>;
