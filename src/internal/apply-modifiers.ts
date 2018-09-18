import { KxResolvedModifier } from './resolved-modifier';
import { isObject } from '../utils/is-object';

export function applyModifiers<T>(obj: T, ...resolvedModifiers: KxResolvedModifier<T>[]): T {
  if (!isObject(obj)) {
    return Object.create(null);
  }

  for (let resolvedModifier of resolvedModifiers) {
    if (!isObject(resolvedModifier)) {
      continue;
    }

    for (let key in resolvedModifier) {
      if (!Object.prototype.hasOwnProperty.call(obj, key) || !isObject(obj[key]) || !isObject(resolvedModifier[key])) {
        obj[key] = resolvedModifier[key];

        continue;
      }

      obj[key] = Object.assign(obj[key], resolvedModifier[key]);
    }
  }

  return obj;
}
