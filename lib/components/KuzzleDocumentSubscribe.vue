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
    searchHit: {
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
    this.syncedSource = this.searchHit._source
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
          this.searchHit._index,
          this.searchHit._type,
          {
            ids: {
              values: [this.searchHit._id]
            }
          }, notification => {
            this.syncedSource = notification.result._source
          })
      }
      catch (error) {
        this.syncedSource = this.searchHit._source;
        this.error = error;
      }
      finally {
        this.loading = false;
      }
    }
  }
}
</script>
