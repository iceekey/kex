import { applyModifiers, resolveModifiers, kxStore } from './src';
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
    await expect(resolveModifiers('42' as any)).resolves.toEqual([]);
    await expect(resolveModifiers(42 as any)).resolves.toEqual([]);
    await expect(resolveModifiers(true as any)).resolves.toEqual([]);
    await expect(resolveModifiers(NaN as any)).resolves.toEqual([]);
    await expect(resolveModifiers(null)).resolves.toEqual([]);
    await expect(resolveModifiers(undefined)).resolves.toEqual([]);
  });

  test('resolve modifiers should pass invalid or empty iterable', () => {
    expect(
      resolveModifiers<any>(
        (function*() {
          yield { foo: '1' };
        })(),
        null,
        (function*() {
          yield Promise.resolve({ foo: '2' });
        })(),
        undefined,
        (function*() {
          yield Promise.resolve({ foo: '3' });
        })(),
        (function*() {
          yield { foo: '4' };
        })(),
        (function*() {})()
      )
    ).resolves.toEqual([{ foo: '1' }, { foo: '2' }, { foo: '3' }, { foo: '4' }]);
  });

  test('resolve modifiers should properly resolve iterators', () => {
    expect(
      resolveModifiers<any>(
        (function*() {
          yield { foo: '1' };
          yield { foo: '2' };
          yield Promise.resolve({ foo: '3' });
          yield { foo: '4' };
        })()
      )
    ).resolves.toEqual([{ foo: '1' }, { foo: '2' }, { foo: '3' }, { foo: '4' }]);
  });
});

describe('storage tests', () => {
  test('storage should update properly', () => {
    kxStore.update({ foo: 'foo' });
    kxStore.update({ bar: 'bar' });

    expect(kxStore.get()).toEqual({ foo: 'foo', bar: 'bar', actions: [] });
  });

  test('storage should clear properly', () => {
    kxStore.update({ foo: 'foo', bar: 'bar' });
    kxStore.clear();

    expect(kxStore.get()).toEqual({ actions: [] });
  });

  test('replace reducers should error on wrong input', () => {
    expect(() => kxStore.replaceReducers('42' as any)).toThrowError();
    expect(() => kxStore.replaceReducers(42 as any)).toThrowError();
    expect(() => kxStore.replaceReducers(true as any)).toThrowError();
    expect(() => kxStore.replaceReducers(NaN as any)).toThrowError();
    expect(() => kxStore.replaceReducers(null)).toThrowError();
    expect(() => kxStore.replaceReducers(undefined)).toThrowError();
    expect(() => kxStore.replaceReducers([] as any)).toThrowError();
    expect(() => kxStore.replaceReducers({} as any)).toThrowError();
  });

  test('replace reducers should work properly', () => {
    expect(
      kxStore.replaceReducers(
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

          yield Promise.resolve({ bar: action.payload });
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
    ).toBe(kxStore);
  });

  test('storage dispatch should throw an error in case of wrong input', async () => {
    await expect(kxStore.dispatch('42' as any)).rejects.toThrowError();
    await expect(kxStore.dispatch(42 as any)).rejects.toThrowError();
    await expect(kxStore.dispatch(true as any)).rejects.toThrowError();
    await expect(kxStore.dispatch(NaN as any)).rejects.toThrowError();
    await expect(kxStore.dispatch(null)).rejects.toThrowError();
    await expect(kxStore.dispatch(undefined)).rejects.toThrowError();
    await expect(kxStore.dispatch([] as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({} as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: 42 } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: true } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: NaN } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: null } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: undefined } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: [] } as any)).rejects.toThrowError();
    await expect(kxStore.dispatch({ type: {} } as any)).rejects.toThrowError();
  });

  test('storage dispatch should work properly on simple actions', async () => {
    expect(await kxStore.dispatch({ type: 'FOO' })).toEqual({ foo: 'bar', actions: [] });
  });

  test('storage dispatch should work properly on actions with payload', async () => {
    expect(await kxStore.dispatch({ type: 'SET', payload: 'test' })).toEqual({
      foo: 'bar',
      bar: 'test',
      actions: []
    });
  });

  test('storage dispatch for chained actions should work properly', async () => {
    kxStore.clear();

    expect(
      await kxStore.dispatch({
        type: 'INVOKE',
        payload: [{ type: 'SET', payload: 'foo' }, { type: 'SET', payload: 'test' }, { type: 'FOO' }]
      })
    ).toEqual({
      foo: 'bar',
      bar: 'test',
      actions: []
    });
  });

  test('storage dispatch should error if actoins are not valid', async () => {
    kxStore.clear();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: '42'
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: 42
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: true
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: NaN
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: null
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: undefined
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: {}
      })
    ).rejects.toThrowError();

    await expect(
      kxStore.dispatch({
        type: 'INVOKE',
        payload: () => {}
      })
    ).rejects.toThrowError();
  });

  test('change history max size should throw an error on wrong input', async () => {
    expect(() => kxStore.setHistoryMaxSize('42' as any)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize(true as any)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize(NaN as any)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize(null)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize(undefined)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize([] as any)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize({} as any)).toThrowError();
    expect(() => kxStore.setHistoryMaxSize((() => {}) as any)).toThrowError();
  });

  test('history should work properly', async () => {
    kxStore.setHistoryMaxSize(3);
    kxStore.clear();

    await expect(
      kxStore.dispatch({ type: 'FOO' }).then(() => {
        kxStore.update({ test: 'test' });
        kxStore.clear();
        return Promise.resolve(kxStore.history());
      })
    ).resolves.toEqual([
      { action: null, changes: [{ actions: [], foo: undefined, test: undefined }] },
      { action: null, changes: [{ test: 'test' }] },
      { action: 'FOO', changes: [{ foo: 'bar' }] }
    ]);
  });

  test('listeners should throw an error on wrong input', () => {
    expect(() => kxStore.addStorageListener('42' as any)).toThrowError();
    expect(() => kxStore.addStorageListener(42 as any)).toThrowError();
    expect(() => kxStore.addStorageListener(true as any)).toThrowError();
    expect(() => kxStore.addStorageListener(NaN as any)).toThrowError();
    expect(() => kxStore.addStorageListener(null)).toThrowError();
    expect(() => kxStore.addStorageListener(undefined)).toThrowError();
    expect(() => kxStore.addStorageListener([] as any)).toThrowError();
    expect(() => kxStore.addStorageListener({} as any)).toThrowError();
  });

  test('listeners on actions should work properly', done => {
    const listener = (store, change) => {
      expect(store).toEqual({ actions: [], foo: 'bar' });
      expect(change).toEqual({ action: 'FOO', changes: [{ foo: 'bar' }] });
      done();

      kxStore.removeStorageListener(listener);
    };

    kxStore.clear();
    kxStore.addStorageListener(listener);

    kxStore.dispatch({ type: 'FOO' });
  });

  test('listeners on update storage should work properly', done => {
    const listener = (store, change) => {
      expect(store).toEqual({ actions: [], test: 'test' });
      expect(change).toEqual({ action: null, changes: [{ test: 'test' }] });
      done();

      kxStore.removeStorageListener(listener);
    };

    kxStore.clear();
    kxStore.addStorageListener(listener);

    kxStore.update({ test: 'test' });
  });

  test('listeners on clear storage should work properly', done => {
    const listener = (store, change) => {
      expect(store).toEqual({ actions: [] });
      expect(change).toEqual({ action: null, changes: [{ actions: [], test: undefined }] });
      done();

      kxStore.removeStorageListener(listener);
    };

    kxStore.clear();
    kxStore.update({ test: 'test' });
    kxStore.addStorageListener(listener);

    kxStore.clear();
  });
});
