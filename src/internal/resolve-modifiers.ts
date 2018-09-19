import { KxModifier } from './modifier';
import { KxResolvedModifier } from './resolved-modifier';
import { isObject } from '../utils/is-object';

export async function resolveModifiers<T>(...modifiers: Array<KxModifier<T>>): Promise<Array<KxResolvedModifier<T>>> {
  const resolvedModifiers: Array<KxResolvedModifier<T>> = [];

  for (let modifierIterator of modifiers) {
    if (!isObject(modifierIterator) || typeof modifierIterator[Symbol.iterator] !== 'function') {
      continue;
    }

    for (let modifier of modifierIterator) {
      resolvedModifiers.push(await Promise.resolve(modifier));
    }
  }

  return resolvedModifiers;
}
