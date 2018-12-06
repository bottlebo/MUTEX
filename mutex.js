class Mutex {
  constructor() {
    this._locked = [];
    this._queue = [];
    this._allPromises = null;
    this._timeOutPromise = null;
    this.r = null
    this.releases = [];
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
      //const ticket = 
      _promises.push(new Promise(resolve => this._queue[key].push(resolve)));
      if (!this._locked[key]) {
        this._dispatchNext(key);
      }
    }
    // this._timeOutPromise = new Promise((resolve, reject) => {
    //   setTimeout(this._timeOut.bind(this, resolve, reject), 50)
    // }
    // )
    //_promises.push(this._timeOutPromise);
//console.log(this._queue)
    this._allPromises = Promise.all(_promises)
    .then((releases)=>{this.releases = releases});//.map(p => p.catch(() => undefined)));

    return this._allPromises
    //new Promise((resolve, reject) => {this.r = resolve});//Promise.race([this._allPromises, this._timeOutPromise]);
    //ticket;
  }
  _timeOut(resolve, reject) {
    //console.log(this._timeOutPromise);
    console.log('---')
    reject('*mutex timed out');
    throw new Error('mutex timed out')
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
        // console.log('===')
        // console.log(callback)
        // console.log(release)
        return Promise
          .resolve(result)
          .then((x) => (/* release() */this.release(release), x),
            e => {/* release() */this.release(release); throw e;}
          );
      });
  }
  release(_releases) {
    const releases = this.releases;
    console.log(releases)
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