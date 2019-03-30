# Vue.js Kuzzle Plugin

This plugin shares the Kuzzle SDK instance in your Vue.js components.

## Getting started

Install both of kuzzle-sdk (@>=6.0.0) and this Vue.js plugin via

```bash
npm install --save kuzzle-sdk">=6.0.0" vue-kuzzle
```

Then, in your application, you need to register the plugin in the `Vue` class.

```javascript
import { Kuzzle, Websocket } from 'kuzzle-sdk';
import VuePluginKuzzle from 'vue-kuzzle';

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle.example.com', { sslConnection: true })
);

Vue.use(VuePluginKuzzle, kuzzle);
```

> if no kuzzle instance is provided, a default one pointing to `ws://localhost:7512` will be created

Depending on your application, you may need to defer connection to kuzzle server later on your application lifecycle (like an offline first app) or connect directly your backend before running Vue.js

## Accessing the Kuzzle SDK instance

### Inside a `vue` component

You'll be able to access the shared Kuzzle SDK instance from any components using `this.$kuzzle` in any `Vue` instance

```javascript
Vue.component('my-component', {
  data() {
    return {
      roomId: null,
    }
  },
  methods: {
    subscribe() {
      this.roomId = await this.$kuzzle.realtime.subscribe(
        'index',
        'collection',
        {},
        notification => {
          console.log(`received notification: ${notification}`);
        }
      );
    }
  }
});
```

### From anywhere _(like a `vuex` store)_

You'll be able to access the shared Kuzzle SDK instance from any other file (like a `vuex` store)

```javascript
import VuePluginKuzzle from 'vue-kuzzle';

async function doThing() {
  const results = VuePluginKuzzle.kuzzle.document.search(
    'index',
    'collection',
    {}
  );
}
```

## Register kuzzle events listener

You might need to create a component to handle specific kuzzle events (`queryError`, `tokenExpired`, and so on)

You can do it by registering events listeners from kuzzle directly inside your components. They will be re-registered if the kuzzle connection is changed anywhere else.

```javascript
Vue.component('my-component', {
  data() {
    return {
      documents: [],
    }
  },
  kuzzle: {
    async connected() {
      this.search()
    },
    async reconnected() {
      this.search()
    }
  },
  methods: {
    search() {
      const response = await this.$kuzzle.document.search(
        'index',
        'collection',
        {}
      );

      this.documents = response.hits;
    }
  }
});
```

> the `connected` and `disconnected` events will be trigged on component creation if the connection is already in the requested state

## Switching connection & protocols

You might need to switch the active connection between different servers.
You can set the `this.$kuzzle` property by a new instance of `Kuzzle`, the plugin will try to connect the new instance if a previous connection was open.

```javascript
import { Kuzzle, Websocket } from 'kuzzle-sdk';

Vue.component('my-component', {
  methods: {
    connectToArchive() {
      this.$kuzzle = new Kuzzle(
        new WebSoket('archive.kuzzle.example.com', { sslConnection: true })
      );
    }
  }
});
```

## Kuzzle common components

### KuzzleDocumentSearch

```javascript
<template>
  <KuzzleDocumentSearch
    index="my-index"
    collection="my-collection"
    query="{}"
    options="{}"
    v-slot="{ hits, total, loading, error }"
  >
    <span>total: {{ total }}</span>
    <span>is loading: {{ loading }}</span>
    <span>last error: {{ error }}</span>
    <ul>
      <li v-for="hit in hits">{{ hit }}</li>
    </ul>
  </KuzzleDocumentSearch>
</template>
```

### KuzzleDocumentSubscribe

```javascript
<template>
  <KuzzleDocumentSubscribe
    search-hit="{}"
    v-slot="{ syncedSource, loading, error }"
  >
    <span>is loading: {{ loading }}</span>
    <span>last error: {{ error }}</span>
    <div>{{ syncedSource }}</div>
  </KuzzleDocumentSubscribe>
</template>
```
