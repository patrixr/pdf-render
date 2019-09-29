class Cache {

  constructor() {
    this.cache = {};
  }

  set(key, data) {
    this.cache[key] = data;
  }

  get(key) {
    return this.cache[key];
  }

  clear(key) {
    delete this.cache[key];
  }

}

module.exports = Cache;