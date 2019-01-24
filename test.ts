import { applyModifiers, resolveModifier, store } from './src';
import { KxAction } from './src/internal/action';

describe('apply modifiers tests', () => {
  test('apply modifiers should not thow an error if first argument is not an object', () => {
    expect(applyModifiers('42')).toEqual({});
    expect(applyModifiers(42)).toEqual({});
    expect(applyModifiers(true)).toEqual({});
    expect(applyModifiers(NaN)).toEqual({});
    expect(applyModifiers(null)).toEqual({});
    expect(applyModifiers(undefined)).toEqual({});
    expect(applyModifiers([])).toEqual({});
  });

  test('apply modifiers should not error on wrong input', () => {
    expect(applyModifiers({}, '42' as any)).toEqual({});
    expect(applyModifiers({}, 42 as any)).toEqual({});
    expect(applyModifiers({}, true as any)).toEqual({});
    expect(applyModifiers({}, NaN as any)).toEqual({});
    expect(applyModifiers({}, null)).toEqual({});
    expect(applyModifiers({}, undefined)).toEqual({});
    expect(applyModifiers({}, [])).toEqual({});
  });

  test('apply modifiers should add properties if needed', () => {
    expect(applyModifiers({}, { foo: 'bar' })).toEqual({ foo: 'bar' });
  });

  test('apply modifiers should replace values with objects if needed', () => {
    expect(applyModifiers({ foo: 'bar' }, { foo: { foo: 'bar' } } as any)).toEqual({ foo: { foo: 'bar' } });
  });

  test('apply modifiers should replace objects with values if needed', () => {
    expect(applyModifiers({ foo: { foo: 'bar' } }, { foo: null } as any)).toEqual({ foo: null });
  });

  test('apply modifiers should remove value if undefined', () => {
    expect(applyModifiers({ foo: 'foo', bar: 'bar' }, { bar: undefined })).toEqual({ foo: 'foo' });
  });

  test('apply modifiers should merge properly', () => {
    expect(
      applyModifiers(
        {
          foo: 'bar',
          bar: {
            foo: () => {}
          }
        } as any,
        {
          foo: {
            foo: 'bar',
            bar: {
              foo: 'bar',
              bar: 'bar'
            }
          },
          bar: {
            foo: 'foo',
            bar: []
          }
        },
        {
          foo: {
            foo: 'foo',
            bar: {
              foo: 'foo'
            }
          },
          bar: {
            bar: 'bar'
          }
        }
      )
    ).toEqual({
      foo: {
        foo: 'foo',
        bar: {
          foo: 'foo',
          bar: 'bar'
        }
      },
      bar: {
        foo: 'foo',
        bar: 'bar'
      }
    });
  });
});

describe('resolve modifiers tests', () => {
  test('resolve modifiers should not throw an error on wrong input', async () => {
    await expect(resolveModifier('42' as any)).resolves.toEqual([]);
    await expect(resolveModifier(42 as any)).resolves.toEqual([]);
    await expect(resolveModifier(true as any)).resolves.toEqual([]);
    await expect(resolveModifier(NaN as any)).resolves.toEqual([]);
    await expect(resolveModifier(null)).resolves.toEqual([]);
    await expect(resolveModifier(undefined)).resolves.toEqual([]);
  });

  test('resolve modifiers should properly resolve iterators', async () => {
    await expect(
      resolveModifier<any>(
        (function*() {
          yield { foo: 'bar' };
        })()
      )
    ).resolves.toEqual([{ foo: 'bar' }]);

    await expect(
      resolveModifier<any>(
        (function*() {
          yield Promise.resolve({ foo: 'bar' });
        })()
      )
    ).resolves.toEqual([{ foo: 'bar' }]);
  });
});

describe('storage tests', () => {
  test('storage should update properly', () => {
    store.update({ foo: 'foo' });
    store.update({ bar: 'bar' });

    expect(store.getState()).toEqual({ foo: 'foo', bar: 'bar', actions: [], cache: {} });
  });

  test('storage should clear properly', () => {
    store.update({ foo: 'foo', bar: 'bar', cache: { foo: 'bar' }, actions: [{ type: 'INVOKE' }] });
    store.clear();

    expect(store.getState()).toEqual({ actions: [], cache: {} });
  });

  test('replace reducers should error on wrong input', () => {
    expect(() => store.replaceReducers('42' as any)).toThrowError();
    expect(() => store.replaceReducers(42 as any)).toThrowError();
    expect(() => store.replaceReducers(true as any)).toThrowError();
    expect(() => store.replaceReducers(NaN as any)).toThrowError();
    expect(() => store.replaceReducers(null)).toThrowError();
    expect(() => store.replaceReducers(undefined)).toThrowError();
    expect(() => store.replaceReducers([] as any)).toThrowError();
    expect(() => store.replaceReducers({} as any)).toThrowError();
  });

  test('replace reducers should work properly', () => {
    expect(
      store.replaceReducers(
        function*(action: KxAction) {
          if (action.type !== 'FOO') {
            return;
          }

          yield { foo: 'bar' };
        },
        function*(action: KxAction) {
          if (action.type !== 'SET') {
            return;
          }

          yield new Promise(resolve => {
            setTimeout(() => {
              resolve({ bar: action.payload });
            }, Number(action.payload));
          });
        },
        function*(action: KxAction) {
          if (action.type !== 'SET') {
            return;
          }

          const { bar } = store.getState() as any;

          yield new Promise(resolve => {
            setTimeout(() => {
              resolve({ baz: bar });
            }, Number(action.payload));
          });
        },
        function*(action: KxAction) {
          if (action.type !== 'INVOKE') {
            return;
          }

          yield Promise.resolve({
            actions: action.payload
          });
        }
      )
    ).toBe(store);
  });

  test('storage dispatch should throw an error in case of wrong input', async () => {
    await expect(store.dispatch('42' as any)).rejects.toThrowError();
    await expect(store.dispatch(42 as any)).rejects.toThrowError();
    await expect(store.dispatch(true as any)).rejects.toThrowError();
    await expect(store.dispatch(NaN as any)).rejects.toThrowError();
    await expect(store.dispatch(null)).rejects.toThrowError();
    await expect(store.dispatch(undefined)).rejects.toThrowError();
    await expect(store.dispatch([] as any)).rejects.toThrowError();
    await expect(store.dispatch({} as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: 42 } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: true } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: NaN } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: null } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: undefined } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: [] } as any)).rejects.toThrowError();
    await expect(store.dispatch({ type: {} } as any)).rejects.toThrowError();
  });

  test('storage dispatch should work properly on simple actions', async () => {
    expect(await store.dispatch({ type: 'FOO' })).toEqual({ foo: 'bar', actions: [], cache: {} });
  });

  test('storage dispatch should work properly on actions with payload', async () => {
    expect(await store.dispatch({ type: 'SET', payload: '250' })).toEqual({
      foo: 'bar',
      bar: '250',
      baz: '250',
      actions: [],
      cache: {}
    });
  });

  test('storage dispatch for chained actions should work properly', async () => {
    store.clear();

    expect(
      await store.dispatch({
        type: 'INVOKE',
        payload: [{ type: 'SET', payload: '450' }, { type: 'SET', payload: '250' }, { type: 'FOO' }]
      })
    ).toEqual({
      foo: 'bar',
      bar: '250',
      baz: '250',
      actions: [],
      cache: {}
    });
  });

  test('storage dispatch should error if actoins are not valid', async () => {
    store.clear();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: '42'
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: 42
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: true
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: NaN
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: null
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: undefined
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: {}
      })
    ).rejects.toThrowError();

    await expect(
      store.dispatch({
        type: 'INVOKE',
        payload: () => {}
      })
    ).rejects.toThrowError();
  });

  test('change history max size should throw an error on wrong input', async () => {
    expect(() => store.setHistoryMaxSize('42' as any)).toThrowError();
    expect(() => store.setHistoryMaxSize(true as any)).toThrowError();
    expect(() => store.setHistoryMaxSize(NaN as any)).toThrowError();
    expect(() => store.setHistoryMaxSize(null)).toThrowError();
    expect(() => store.setHistoryMaxSize(undefined)).toThrowError();
    expect(() => store.setHistoryMaxSize([] as any)).toThrowError();
    expect(() => store.setHistoryMaxSize({} as any)).toThrowError();
    expect(() => store.setHistoryMaxSize((() => {}) as any)).toThrowError();
  });

  test('history should work properly', async () => {
    store.setHistoryMaxSize(3);
    store.clear();

    console.log(store.getState());

    await expect(
      store.dispatch({ type: 'FOO' }).then(() => {
        store.update({ test: 'test' });
        store.clear();
        return Promise.resolve(store.history());
      })
    ).resolves.toEqual([
      { action: null, changes: { actions: [], foo: undefined, test: undefined } },
      { action: null, changes: { test: 'test' } },
      { action: 'FOO', changes: { foo: 'bar' } }
    ]);
  });

  test('listeners should throw an error on wrong input', () => {
    expect(() => store.addStorageListener('42' as any)).toThrowError();
    expect(() => store.addStorageListener(42 as any)).toThrowError();
    expect(() => store.addStorageListener(true as any)).toThrowError();
    expect(() => store.addStorageListener(NaN as any)).toThrowError();
    expect(() => store.addStorageListener(null)).toThrowError();
    expect(() => store.addStorageListener(undefined)).toThrowError();
    expect(() => store.addStorageListener([] as any)).toThrowError();
    expect(() => store.addStorageListener({} as any)).toThrowError();
  });

  test('listeners on actions should work properly', done => {
    const listener = (state, change) => {
      expect(state).toEqual({ actions: [], cache: {}, foo: 'bar' });
      expect(change).toEqual({ action: 'FOO', changes: { foo: 'bar' } });
      done();

      store.removeStorageListener(listener);
    };

    store.clear();
    store.addStorageListener(listener);

    store.dispatch({ type: 'FOO' });
  });

  test('listeners on update storage should work properly', done => {
    const listener = (state, change) => {
      expect(state).toEqual({ actions: [], cache: {}, test: 'test' });
      expect(change).toEqual({ action: null, changes: { test: 'test' } });
      done();

      store.removeStorageListener(listener);
    };

    store.clear();
    store.addStorageListener(listener);

    store.update({ test: 'test' });
  });

  test('listeners on clear storage should work properly', done => {
    const listener = (state, change) => {
      expect(state).toEqual({ actions: [], cache: {} });
      expect(change).toEqual({ action: null, changes: { actions: [], test: undefined } });
      done();

      store.removeStorageListener(listener);
    };

    store.clear();
    store.update({ test: 'test' });
    store.addStorageListener(listener);

    store.clear();
  });
});

describe('cache tests', () => {
  test('storage should clear cache properly', () => {
    store.clear();
    store.update({ foo: 'bar', actions: [{ type: 'INVOKE' }], cache: { foo: 'bar' } });
    store.clearCache();

    expect(store.getState()).toEqual({ foo: 'bar', actions: [{ type: 'INVOKE' }], cache: {} });
  });

  test('set cache should error on wrong key', () => {
    store.clear();
    expect(() => store.setCache(42 as any, undefined)).toThrowError();
    expect(() => store.setCache(true as any, undefined)).toThrowError();
    expect(() => store.setCache(NaN as any, undefined)).toThrowError();
    expect(() => store.setCache(null, undefined)).toThrowError();
    expect(() => store.setCache(undefined, undefined)).toThrowError();
    expect(() => store.setCache([] as any, undefined)).toThrowError();
    expect(() => store.setCache({} as any, undefined)).toThrowError();
  });

  test('get cache should error on wrong key', () => {
    store.clear();
    expect(() => store.getCache(42 as any)).toThrowError();
    expect(() => store.getCache(true as any)).toThrowError();
    expect(() => store.getCache(NaN as any)).toThrowError();
    expect(() => store.getCache(null)).toThrowError();
    expect(() => store.getCache(undefined)).toThrowError();
    expect(() => store.getCache([] as any)).toThrowError();
    expect(() => store.getCache({} as any)).toThrowError();
  });

  test('set cache should work properly', () => {
    store.clear();
    store.setCache('foo', 'foo_value');
    store.setCache('bar', 'bar_value', 'bar_token');
    store.setCache('baz', 'baz_value', 'baz_token');
    store.setCache('baz', 'baz_updated_value', 'baz_token');
    store.setCache('test', 'test_value', 'test_token');
    store.setCache('test', 'test_updated_value', 'test_updated_token');

    expect(store.getState()).toEqual({
      actions: [],
      cache: {
        foo: { token: undefined, value: 'foo_value' },
        bar: { token: 'bar_token', value: 'bar_value' },
        baz: { token: 'baz_token', value: 'baz_updated_value' },
        test: { token: 'test_updated_token', value: 'test_updated_value' }
      }
    });
  });

  test('get cache should work properly', () => {
    expect(store.getCache('foo')).toEqual('foo_value');
    expect(store.getCache('foo', 'bar')).toEqual(null);
    expect(store.getCache('bar')).toEqual(null);
    expect(store.getCache('bar', 'bar_token')).toEqual('bar_value');
    expect(store.getCache('bar', 'wrong_bar_token')).toEqual(null);
  });
});
