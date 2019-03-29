# Vuejs Kuzzle Plugin

This plugin simply exposes the Kuzzle SDK in your Vuejs components.

## Getting started

Install both of kuzzle-sdk (@>6.0.0) and this vue plugin via

```bash
npm install --save kuzzle-sdk vue-kuzzle
```

Then, in your Vuejs application, you need to register the plugin in your `Vue` class.

```javascript
import { Kuzzle, Websocket } from 'kuzzle-sdk';
import VuePluginKuzzle from 'vue-kuzzle';

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle.example.com', { sslConnection: true })
);

Vue.use(VuePluginKuzzle, kuzzle);
```

## Accessing the Kuzzle SDK instance

### `vue` component

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

### `vuex` store

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

## Switching connection & protocols

You might need to switch connection betweed differents servers.
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
