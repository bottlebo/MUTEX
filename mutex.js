class Mutex {
  constructor() {
    this._locked = new Map();
    this._queue = new Map();
  }
  isLocked(key) {
    return !!this._locked.get(key);
  }
  acquire(keys, asyncFuncExclusive) {
    if (typeof asyncFuncExclusive === 'function')
      return this.runExclusive(keys, asyncFuncExclusive)
    let _keys = [];
    let _promises = [];
    if (Array.isArray(keys)) {
      _keys = keys;
    }
    else {
      _keys.push(keys);
    }
    for (let key of _keys) {
      if (!this._queue.has(key))
        this._queue.set(key, []);
      _promises.push(new Promise(resolve => this._queue.get(key).push(resolve)));
      if (!this._locked.get(key)) {
        this._dispatchNext(key);
      }
    }
    return Promise.all(_promises);
  }
  runExclusive(key, callback) {
    return this
      .acquire(key)
      .then(async (release) => {
        let result;
        try {
          result = await callback();
        } catch (e) {
          this.release(release)
          throw (e);
        }
        return Promise
          .resolve(result)
          .then((x) => (this.release(release), x),
            e => {this.release(release); throw e;}
          );
      });
  }
  release(releases) {
    let r = [];
    if (Array.isArray(releases)) r = releases;
    else r.push(releases);
    for (let f of r) {
      f();
    }
  }
  _dispatchNext(key) {
    if (this._queue.get(key).length > 0) {
      this._locked.set(key, true);
      const resolve = this._queue.get(key).shift();
      if (resolve) {
        resolve(this._dispatchNext.bind(this, key));
      }
    } else {
      this._locked.delete(key);
      this._queue.delete(key);
    }
  }
}
module.exports = Mutex;