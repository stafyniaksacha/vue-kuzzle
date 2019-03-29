<template>
  <div>
    <slot
      :syncedSource="syncedSource"
      :error="error"
      :loading="loading"
    />
  </div>
</template>

<script>
export default {
  name: 'KuzzleDocumentSubscribe',
  props: {
    hit: {
      type: Object,
      required: true
    },
  },
  kuzzle: {
    async connected () { await this._subscribe() },
    async reconnected () { await this._subscribe() },
  },
  data () {
    return {
      roomId: null,
      syncedSource: {},
      error: null,
      loading: false
    }
  },
  created () {
    this.syncedSource = this.hit._source
  },
  beforeDestroy () {
    if (this.roomId) {
      this.$kuzzle.realtime.unsubscribe(this.roomId)
    }
  },
  methods: {
    async _subscribe () {
      this.error = null;
      this.loading = true;

      if (this.roomId) {
        this.$kuzzle.realtime.unsubscribe(this.roomId)
      }

      try {
        this.roomId = await this.$kuzzle.realtime.subscribe(
          this.hit._index,
          this.hit._type,
          {
            ids: {
              values: [this.hit._id]
            }
          }, notification => {
            this.syncedSource = notification.result._source
          })
      }
      catch (error) {
        this.syncedSource = this.hit._source;
        this.error = error;
      }
      finally {
        this.loading = false;
      }
    }
  }
}
</script>
