class Mutex {
  constructor() {
    this._locked = [];
    this._queue = [];
  }
  isLocked(key) {
    return this._locked[key];
  }
  acquire(keys) {
    let _keys = [];
    let _promises = [];
    if (Array.isArray(keys)) {
      _keys = keys;
    }
    else {
      _keys.push(keys);
    }
    for (let key of _keys) {
      if (!this._queue[key])
        this._queue[key] = [];
      _promises.push(new Promise(resolve => this._queue[key].push(resolve)));
      if (!this._locked[key]) {
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
          //release();
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
    if (this._queue[key].length > 0) {
      this._locked[key] = true;
      const resolve = this._queue[key].shift();
      if (resolve) {
        resolve(this._dispatchNext.bind(this, key));
      }
    } else {
      this._locked[key] = false;
    }
  }
}
module.exports = Mutex;