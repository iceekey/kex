import { applyModifiers, resolveModifiers, kxStore } from './src';

test('apply modifiers should not thow an error if first argument is not object', () => {
  expect(applyModifiers('42')).toEqual({});
  expect(applyModifiers(42)).toEqual({});
  expect(applyModifiers(true)).toEqual({});
  expect(applyModifiers(NaN)).toEqual({});
  expect(applyModifiers(null)).toEqual({});
  expect(applyModifiers(undefined)).toEqual({});
  expect(applyModifiers([])).toEqual({});
});

test('apply modifiers should cut all non-modifiers values', () => {
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

test('apply modifiers should merge properly', () => {
  expect(
    applyModifiers(
      {},
      {
        foo: {
          foo: 'bar',
          bar: 'bar'
        },
        bar: {
          foo: 'foo'
        }
      },
      {
        foo: {
          foo: 'foo'
        },
        bar: {
          bar: 'bar'
        }
      }
    )
  ).toEqual({
    foo: {
      foo: 'foo',
      bar: 'bar'
    },
    bar: {
      foo: 'foo',
      bar: 'bar'
    }
  });
});
