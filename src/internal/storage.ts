import { isObject } from '../utils/is-object';
import { KxAction } from './action';
import { KxResolvedModifier } from './resolved-modifier';
import { KxReducer } from './reducer';
import { KxListener } from './listener';
import { KxChange } from './change';
import { applyModifiers } from './apply-modifiers';
import { resolveModifier } from './resolve-modifier';
import { KxState } from './state';

class KxStore {
  private _reducers: KxReducer<KxState>[] = [];
  private _listeners: KxListener[] = [];
  private _state: KxState = {
    cache: {},
    actions: []
  };

  private _historyMaxSize = 10;
  private _history: KxChange[] = [];

  constructor() {}

  private _broadcastChange(change: KxChange): void {
    this._history = [change, ...this._history];

    while (this._history.length > this._historyMaxSize) {
      this._history.pop();
    }

    for (let listener of this._listeners) {
      listener(this._state, change);
    }
  }

  history(): KxChange[] {
    return this._history;
  }

  getState<T>(): KxState<T> {
    return this._state as KxState<T>;
  }

  getCache<T>(key: string, token?: any): null | T {
    if (typeof key !== 'string') {
      throw new Error('cache key should be string');
    }

    if (!isObject(this._state.cache)) {
      return null;
    }

    const cache = this._state.cache[key];

    if (cache === undefined) {
      return null;
    }

    if (cache.token === token) {
      return cache.value;
    }

    return null;
  }

  setCache<T>(key: string, value: any, token?: any): Partial<T> {
    if (typeof key !== 'string') {
      throw new Error('cache key should be string');
    }

    return this.update<T>({ cache: { [key]: { token, value } } } as KxState<T>);
  }

  update<T>(resolvedModifier: KxResolvedModifier<KxState<T>>): KxState<T> {
    this._state = applyModifiers<KxState<T>>(this._state as KxState<T>, resolvedModifier);

    this._broadcastChange({
      action: null,
      changes: resolvedModifier
    } as KxChange);

    return this._state as KxState<T>;
  }

  clear<T>(): KxState<T> {
    const clearModifier = Object.create(null);

    for (let key in this._state) {
      if (!Object.prototype.hasOwnProperty.call(this._state, key)) {
        continue;
      }

      if (key === 'actions') {
        clearModifier[key] = [];

        continue;
      }

      if (key === 'cache') {
        for (let cacheKey in this._state.cache) {
          if (!Object.prototype.hasOwnProperty.call(this._state.cache, cacheKey)) {
            continue;
          }

          if (!isObject(clearModifier[key])) {
            clearModifier[key] = {};
          }

          clearModifier[key][cacheKey] = undefined;
        }

        continue;
      }

      clearModifier[key] = undefined;
    }

    return this.update(clearModifier);
  }

  clearCache<T>(): KxState<T> {
    const clearModifier = Object.create(null);

    if (!isObject(this._state.cache)) {
      clearModifier.cache = undefined;
    } else {
      for (let cacheKey in this._state.cache) {
        if (!Object.prototype.hasOwnProperty.call(this._state.cache, cacheKey)) {
          continue;
        }

        if (!isObject(clearModifier.cache)) {
          clearModifier.cache = {};
        }

        clearModifier.cache[cacheKey] = undefined;
      }
    }

    return this.update(clearModifier);
  }

  replaceReducers(...nextReducers: KxReducer<any>[]): KxStore {
    for (let reducer of nextReducers) {
      if (typeof reducer !== 'function') {
        throw new Error('reducer should be a function');
      }
    }

    this._reducers = nextReducers;

    return this;
  }

  addStorageListener(listener: KxListener): KxStore {
    if (typeof listener !== 'function') {
      throw new Error('storage listener should be a function');
    }

    this._listeners.push(listener);

    return this;
  }

  removeStorageListener(listener: KxListener): KxStore {
    this._listeners = this._listeners.filter(l => l !== listener);

    return this;
  }

  async dispatch<T>(action: KxAction): Promise<KxState<T>> {
    if (!isObject(action)) {
      throw new Error('action should be an object');
    }

    if (typeof action.type !== 'string') {
      throw new Error('action type should be a string');
    }

    let changes = Object.create(null);

    for (let reducer of this._reducers) {
      const resolvedModifiers = await resolveModifier<KxState<T>>((reducer as KxReducer<KxState<T>>)(action));

      this._state = applyModifiers<KxState<T>>(this._state as KxState<T>, ...resolvedModifiers);
      changes = applyModifiers<KxState<T>>(changes, ...resolvedModifiers);
    }

    if (!Array.isArray(this._state.actions)) {
      throw new Error('field actions in state should be an array');
    }

    if (this._state.actions.length > 0) {
      const nextAction = this._state.actions[0];

      this._state.actions = this._state.actions.filter(action => action !== nextAction);
      this._broadcastChange({ action: action.type, changes });

      return await this.dispatch(nextAction);
    }

    this._broadcastChange({ action: action.type, changes });

    return this._state as KxState<T>;
  }

  setHistoryMaxSize(size: number): void {
    if (typeof size !== 'number' || isNaN(size)) {
      throw new Error('history size should be a number');
    }

    this._historyMaxSize = size;
  }
}

export const store = new KxStore();
