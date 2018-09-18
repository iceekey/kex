import { KxModifier } from './modifier';
import { KxResolvedModifier } from './resolved-modifier';

export async function* resolveModifiers<T>(
  ...modifiers: Array<KxModifier<T>>
): AsyncIterableIterator<KxResolvedModifier<T>> {
  for (let modifierIterator of modifiers) {
    for (let modifier of modifierIterator) {
      yield await Promise.resolve(modifier)
    }
  }
}
