<template>
  <div>
    <slot
      :hits="hits"
      :total="total"
      :loading="loading"
      :error="error"
    />
  </div>
</template>

<script>
export default {
  name: 'KuzzleDocumentSearch',
  props: {
    index: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    query: {
      type: Object,
      default: undefined
    },
    options: {
      type: Object,
      default: undefined
    }
  },
  kuzzle: {
    async connected () { await this._search() },
    async reconnected () { await this._search() },
  },
  data () {
    return {
      hits: [],
      total: 0,
      error: null,
      loading: false
    }
  },
  methods: {
    async _search () {
      this.error = null;
      this.loading = true;

      try {
        const response = await this.$kuzzle.document.search(this.index, this.collection, this.query, this.options);
        this.hits = response.hits;
        this.total = response.total;
      }
      catch (error) {
        this.hits = [];
        this.total = 0;
        this.error = error;
      }
      finally {
        this.loading = false;
      }
    }
  }
}
</script>
