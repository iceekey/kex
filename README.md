# Kex

Kex is a tiny library for state managenent for JavaScript/TypeScript projects.

## Installation is simple and plain

```bash
  npm i kex
```

## Principles

Just like [Redux](https://redux.js.org/), Kex has *reducers*, *actions* and *application state*. But this time it's much simplier, because it *not rescrict reducers to be pure functions* (but they might be if you will).

## Actions

Actions is objects that contain `type` and `payload` field:

```
{
  type: stirng;
  payload?: any;
}
```

You can dipatch action using `dispatch` method:

```typescript
import { store } from 'kx';

const dispatcher = store.dispatch(action);

// will print current state after action finishes
dispatcher.then(state => console.log); 
```

## Reducers

Reducers appears to be iterators which can return *modifiers* or promises which should be resolved into modifiers indeed. Modifiers is objects containing information how you want to change the state.

Let's say we have the state:

```typescript
const state = {
  token: null,
  credentials: {
    login: 'example@mail.com',
    password: '********'
  }
}
```

and we want to change `login` field to something else:

```typescript
import { applyModifiers } from 'kx'; // apply modifiers to specific object

const changeLoginModifier = {
  credentials: {
    login: 'whatever@we-want.com'
  }
}

// this will change state to:
// const state = {
//   token: null,
//   credentials: {
//     login: 'whatever@we-want.com',
//     password: '********'
//   }
// }
applyModifiers(state, changeLoginModifier);
```

As you can see, modifiers may contain only changes we want to apply to our state. `applyModifiers` word recursively and merge any level change right into your state.

A typical reducer may look like this:

```typescript
const function* reducer(action: KxAction) {
  switch (action.type) {
    ...
    case 'action_name':
      yield { some: 'changes' };
      break;
    ...
    case 'another_action_name':
      // async reducers out of box
      yield Promise.resolve({ more: 'changes' });
      break;
    ...
  }
}
```

Also Kex allows you to create *chainable actions*. This means that your reducer may dispatch actions on its own. To do that you should use actions field on the top of your state:

```typescript
const function* reducerWithChainableAction(action: KxAction) {
  switch (action.type) {
    ...
    case 'chainable_action':
      const { actions } = store.get()

      yield {
        some: 'changes',
        actions: [
          // if other reducers added thier actions in queue
          ...actions, 
          // after current action perform specified actions
          { type: 'action_name' },
          { type: 'another_action_name', payload: your_payload }
        ]
      };
      break;
    ...
  }
}
```

`actions` field creates and clears automatically, all you need to do is add some actions in case you need it. 

To set reducers use `replaceReducers` method:

```typescript
import { store } from 'kx';

store.replaceReducers(...reducers);
```

Reducers order in array actually matters because *resolving process in linear*.  It means that reducers change the state one by one even if they async.

## State

You can import storage at any point of your application. Use method `get` to get current state:

```typescript
import { store } from 'kx';

store.get();
```

To modify your state without actions you may use `update` method:

```typescript
import { store } from 'kx';

store.update(modifier);
```

You can subscribe to state changes using `addStorageListener` (and cancel the subscription using `removeStorageListener` method):

```typescript
import { store } from 'kx';

const listener = (state, change) => {
  console.log(change.action === null ? 'Changed manually' : `By ${change.action} action`);
  console.log(`Changes: `, change.changes);
};

store.addStorageListener(listener);
store.removeStorageListener(listener);
```

You also can get history of state change using `history()` method:

```typescript
import { store } from 'kx';

store.setHistoryMaxSize(10); // 10 is default value

store.history(); // will return 10 last actions
```

To clear your state use `clear` method:

```typescript
import { store } from 'kx';

store.clear();
```

`update` and `clear` methods will appear in history, but `action` field will be set to `null`.

## Example

```typescript
  import { store, KxAction } from 'kex';

  store.update({
    counter: 0,
    thisWillNotBeChanged: null
  })

  const function* counterReducer(action: KxAction) {
    const { counter } = kxStore.get();
    
    switch (action.type) {
      case 'INCREMENT':
        yield {
          counter: counter + 1;
        };
        break;
      case 'ADD': 
        if (action.payload < counter) {
          return;
        }
      
        yield {
          actions: Array(action.payload - counter).fill({ type: 'INCREMENT' })
        }
    }
  }

  store.replaceReducers(counterReducer);

  // {
  //   counter: 10,
  //   thisWillNotBeChanged: null
  // }
  store.dispatch({ type: 'ADD', payload: 10 }).then(console.log);

```

## Contributing

If you want to contribute to project please contact me. I'm open to discuss the concept.
