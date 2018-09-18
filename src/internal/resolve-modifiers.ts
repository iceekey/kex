import { KxModifier } from './modifier';
import { KxResolvedModifier } from './resolved-modifier';

export async function resolveModifiers<T>(...modifiers: Array<KxModifier<T>>): Promise<Array<KxResolvedModifier<T>>> {
  throw new Error('function resolveModifiers() not implemented yet');
}
