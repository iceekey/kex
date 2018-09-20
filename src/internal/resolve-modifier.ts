import { KxModifier } from './modifier';
import { KxResolvedModifier } from './resolved-modifier';
import { isObject } from '../utils/is-object';

export async function resolveModifier<T>(itrarableModifier: KxModifier<T>): Promise<Array<KxResolvedModifier<T>>> {
  const resolvedModifiers: Array<KxResolvedModifier<T>> = [];

  if (!isObject(itrarableModifier) || typeof itrarableModifier[Symbol.iterator] !== 'function') {
    return Promise.resolve([]);
  }

  for (let modifier of itrarableModifier) {
    resolvedModifiers.push(await Promise.resolve(modifier));
  }

  return resolvedModifiers;
}
