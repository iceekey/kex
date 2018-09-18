import { KxResolvedModifier } from './resolved-modifier';

export type KxModifier<T> = Iterable<KxResolvedModifier<T> | Promise<KxResolvedModifier<T>>>;
