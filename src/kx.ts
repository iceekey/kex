export function isObject(val) {
  return Array.isArray(val) === false && typeof val === 'object' && val !== null;
}

export interface KxAction {
  type: string;
  payload?: any;
}

export type KxResolvedModifier<T> = Partial<T>;
export type KxModifier<T> = Iterable<KxResolvedModifier<T>> | Iterable<Promise<KxResolvedModifier<T>>>;

export async function resolveModifiers<T>(...modifiers: Array<KxModifier<T>>): Promise<Array<KxResolvedModifier<T>>> {
  throw new Error('function resolveModifiers() not implemented yet');
}

export function applyModifiers<T>(obj: T, ...resolvedModifiers: KxResolvedModifier<T>[]): T {
  throw new Error('function applyModifiers() not implemented yet');
}

export type KxReducer<T = any> = (action: KxAction) => KxModifier<T>;

export interface KxChange {
  action: string;
  changes: object[];
}

export type KxListener = (state: any, change: KxChange) => any;

class KxStore<T = any> {
  private _reducers: KxReducer<T>[] = [];
  private _listeners: KxListener[] = [];
  private _state: any = {
    actions: []
  };

  private _historyMaxSize = 10;
  private _history: KxChange[];

  constructor() {}

  private _broadcastChange(change: KxChange) {
    this._history.push(change);

    if (this._history.length > this._historyMaxSize) {
      this._history.pop();
    }

    for (let i; i < this._listeners.length; i++) {
      this._listeners[i](this._state, change);
    }
  }

  get(): T {
    return this._state as T;
  }

  async update(resolvedModifier: KxResolvedModifier<T>): Promise<T> {
    this._state = applyModifiers(this._state, resolvedModifier);

    this._broadcastChange({
      action: null,
      changes: [resolvedModifier]
    } as KxChange);

    return this._state;
  }

  replaceReducers(...nextReducers: KxReducer<T>[]): KxStore<T> {
    for (let i = 0; i < nextReducers.length; i++) {
      if (typeof nextReducers[i] !== 'function') {
        throw new Error('reducer should be a function');
      }
    }

    this._reducers = nextReducers;

    return this;
  }

  addStorageListener(listener: KxListener): KxStore<T> {
    if (typeof listener !== 'function') {
      throw new Error('storage listener should be a function');
    }

    this._listeners.push(listener);

    return this;
  }

  removeStorageListener(listener: Function): KxStore<T> {
    this._listeners = this._listeners.filter(l => l !== listener);

    return this;
  }

  async dispatch(action: KxAction): Promise<T> {
    if (!isObject(action)) {
      throw new Error('action should be an action');
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
      const nextAction = this._state.actions.pop();

      this._broadcastChange({ action: action.type, changes: resolvedModifiers });

      return this.dispatch(nextAction);
    }

    this._broadcastChange({ action: action.type, changes: resolvedModifiers });

    return this._state;
  }

  setHistoryMaxSize(size: number) {
    if (typeof size !== 'number') {
      throw new Error('history size should be a number');
    }

    this._historyMaxSize = size;
  }
}

export const kxStore = new KxStore();

if (this.window === this) {
  window['__get___'] = kxStore.get;
}
