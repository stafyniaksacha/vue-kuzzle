import Vue from 'vue';
import { Kuzzle, WebSocket } from 'kuzzle-sdk';
import VuePluginKuzzle from '../dist/vue-plugin-kuzzle';

Vue.use(VuePluginKuzzle);

new Vue({
  el: '#app',
  data() {
    return {
      isComponentConnected: false
    };
  },
  methods: {
    connect() {
      this.$kuzzle.connect();
    },
    disconnect() {
      this.$kuzzle.disconnect();
    },
    switchLocalServer() {
      this.$kuzzle = new Kuzzle(new WebSocket('127.0.0.1'));
    },
    switchRemoteServer() {
      this.$kuzzle = new Kuzzle(
        new WebSocket('127.0.0.1', {
          port: '7512',
          sslConnection: true
        })
      );
    }
  },
  template: `<div>
    <span v-if="isComponentConnected">connected</span>
    <span v-else>disconnected</span>
    <button @click="connect">connect</button>
    <button @click="disconnect">disconnect</button>
    <button @click="switchLocalServer">switch local server</button>
    <button @click="switchRemoteServer">switch remote server</button>
    <KuzzleDocumentSearch index="my-index" collection="my-collection" v-slot="{ hits, total, loading, error }">
      {{ total }}
      {{ loading }}
      {{ error }}
      <ul>
        <li v-for="hit in hits">
          <KuzzleDocumentSubscribe :search-hit="hit" v-slot="{ syncedSource }">{{ syncedSource }}</KuzzleDocumentSubscribe>
        </li>
      </ul>
    </KuzzleDocumentSearch>
  </div>`,
  kuzzle: {
    async connected() {
      this.isComponentConnected = true;
    },
    async reconnected() {
      this.isComponentConnected = true;
    },
    async disconnected() {
      this.isComponentConnected = false;
    }
  }
});
