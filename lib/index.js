import { Kuzzle, WebSocket } from 'kuzzle-sdk';
import KuzzleDocumentSearch from './components/KuzzleDocumentSearch.vue';
import KuzzleDocumentSubscribe from './components/KuzzleDocumentSubscribe.vue';

const events = [
  'connected',
  'discarded',
  'disconnected',
  'loginAttempt',
  'networkError',
  'offlineQueuePush',
  'offlineQueuePop',
  'queryError',
  'reconnected',
  'tokenExpired'
];

let _kuzzle;
let _installed = false;

function flattenHits(result) {
  const hits = result.hits.map(document => {
    const object = {
      _source: document._source,
      _id: document._id,
      _meta: document._meta
    };

    return object;
  });

  return hits;
}

class VuePluginKuzzle {
  static get kuzzle() {
    return _kuzzle;
  }
  static set kuzzle(kuzzle) {
    if (_kuzzle instanceof Kuzzle) {
      // register listeners to new kuzzle instance
      for (let event of events) {
        let listeners = _kuzzle.listeners(event);
        for (let listener of listeners) {
          kuzzle.addListener(event, listener);
        }
      }

      // switch connection between old and new kuzzle instances
      if (_kuzzle.protocol.isReady()) {
        _kuzzle.disconnect();
        kuzzle.connect();
      }
    }

    _kuzzle = kuzzle;
  }

  static get installed() {
    return _installed;
  }
  static set installed(installed) {
    _installed = installed;
  }

  static install(Vue, kuzzle = new Kuzzle(new WebSocket('localhost'))) {
    if (!kuzzle instanceof Kuzzle) {
      throw new Error(
        'VuePluginKuzzle: a valid kuzzle instance must be provided'
      );
    }

    this.kuzzle = kuzzle;

    // proxify Vue.prototype.$kuzzle getters/setters to VuePluginKuzzle.kuzzle getters/setters
    Object.defineProperty(Vue.prototype, '$kuzzle', {
      get: _ => this.kuzzle,
      set: kuzzle => {
        this.kuzzle = kuzzle;
      }
    });

    // install components
    Vue.component('KuzzleDocumentSearch', KuzzleDocumentSearch);
    Vue.component('KuzzleDocumentSubscribe', KuzzleDocumentSubscribe);

    // install lifecycle hooks
    Vue.mixin({
      // once a component is created, check if any kuzzle option is set
      // if any, register listeners for alowed events to kuzzle
      async created() {
        let listeners = this.$options['kuzzle'];

        for (let event in listeners) {
          if (events.includes(event)) {
            if (typeof this.$options['kuzzle'][event] !== 'function') {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `[VuePluginKuzzle] Listener for "${event}" event should be a function`
                );
              }
              continue;
            }

            switch (event) {
              case 'disconnected':
                // run 'disconnected' event immediatly if already offline
                if (!this.$kuzzle.protocol.isReady()) {
                  await this.$options['kuzzle'][event].call(this);
                }
                this.$kuzzle.addListener(event, async _ => {
                  await this.$options['kuzzle'][event].call(this);
                });
                break;
              case 'connected':
                // run 'connected' event immediatly if already online
                if (this.$kuzzle.protocol.isReady()) {
                  await this.$options['kuzzle'][event].call(this);
                }
                this.$kuzzle.addListener(event, async _ => {
                  await this.$options['kuzzle'][event].call(this);
                });
                break;
              default:
                this.$kuzzle.addListener(event, async args => {
                  await this.$options['kuzzle'][event].call(this, args);
                });
                break;
            }
          }
        }
      },
      // un-register component's events from kuzzle before destroying it
      beforeDestroy() {
        let listeners = this.$options['kuzzle'];

        for (let event in listeners) {
          if (events.includes(event)) {
            if (typeof this.$options['kuzzle'][event] !== 'function') {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `[VuePluginKuzzle] Listener for "${event}" event should be a function`
                );
              }
              continue;
            }

            this.$kuzzle.removeListener(event, this.$options['kuzzle'][event]);
          }
        }
      }
    });
  }
}

export default VuePluginKuzzle;
export { flattenHits };
