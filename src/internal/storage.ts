import { isObject } from '../utils/is-object';
import { KxAction } from './action';
import { KxResolvedModifier } from './resolved-modifier';
import { KxReducer } from './reducer';
import { KxListener } from './listener';
import { KxChange } from './change';
import { applyModifiers } from './apply-modifiers';
import { resolveModifiers } from './resolve-modifiers';

class KxStorage<T = any> {
  private _reducers: KxReducer<T>[] = [];
  private _listeners: KxListener[] = [];
  private _state: any = {
    actions: []
  };

  private _historyMaxSize = 10;
  private _history: KxChange[] = [];

  constructor() {}

  private _broadcastChange(change: KxChange) {
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

  get(): T {
    return this._state as T;
  }

  update(resolvedModifier: KxResolvedModifier<T>): T {
    this._state = applyModifiers(this._state, resolvedModifier);

    this._broadcastChange({
      action: null,
      changes: [resolvedModifier]
    } as KxChange);

    return this._state;
  }

  clear() {
    const clearModifier = Object.create(null);

    for (let key in this._state) {
      if (!Object.prototype.hasOwnProperty.call(this._state, key)) {
        continue;
      }

      if (key === 'actions') {
        clearModifier[key] = [];

        continue;
      }

      clearModifier[key] = undefined;
    }

    return this.update(clearModifier);
  }

  replaceReducers(...nextReducers: KxReducer<T>[]): KxStorage<T> {
    for (let reducer of nextReducers) {
      if (typeof reducer !== 'function') {
        throw new Error('reducer should be a function');
      }
    }

    this._reducers = nextReducers;

    return this;
  }

  addStorageListener(listener: KxListener): KxStorage<T> {
    if (typeof listener !== 'function') {
      throw new Error('storage listener should be a function');
    }

    this._listeners.push(listener);

    return this;
  }

  removeStorageListener(listener: Function): KxStorage<T> {
    this._listeners = this._listeners.filter(l => l !== listener);

    return this;
  }

  async dispatch(action: KxAction): Promise<T> {
    if (!isObject(action)) {
      throw new Error('action should be an object');
    }

    if (typeof action.type !== 'string') {
      throw new Error('action type should be a string');
    }

    const resolvedModifiers = await resolveModifiers(...this._reducers.map(reducer => reducer(action)));
    this._state = applyModifiers(this._state, ...resolvedModifiers);

    if (!Array.isArray(this._state.actions)) {
      throw new Error('field actions in state should be an array');
    }

    if (this._state.actions.length > 0) {
      const nextAction = this._state.actions[0];

      this._state.actions = this._state.actions.filter(action => action !== nextAction);
      this._broadcastChange({ action: action.type, changes: resolvedModifiers });

      return await this.dispatch(nextAction);
    }

    this._broadcastChange({ action: action.type, changes: resolvedModifiers });

    return this._state;
  }

  setHistoryMaxSize(size: number) {
    if (typeof size !== 'number' || isNaN(size)) {
      throw new Error('history size should be a number');
    }

    this._historyMaxSize = size;
  }
}

export const kxStore = new KxStorage();
