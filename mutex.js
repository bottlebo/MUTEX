const {cancellablePromise, CancelToken, CancelError} = require('./cp')
class Mutex {
  constructor(options) {
    this._options = options || {};
    this._locked = [];
    this._queue = [];
    this._allPromises = null;
    this._timeOutPromise = null;
    this._cancelToken = new CancelToken()
    this._promises = [];

    if (this._options.timeOut)
      this._timeOutPromise = new Promise((resolve, reject) => {
        setTimeout(
          () => {console.log('cancel');this._cancelToken.cancel()}, this._options.timeOut)
      })

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
      if (!this._queue[key]) {
        this._queue[key] = [];
      }
      //const ticket = 
      _promises.push(
          cancellablePromise(new Promise((resolve, reject) => {this._queue[key].push(resolve)}), this._cancelToken)
      // //     /* setTimeout(()=>{reject('time out*'), console.log('timer')},this._options.timeOut) */ }), this._cancelToken)
       );
      //_promises.push(new Promise((resolve, reject) => {this._queue[key].push(resolve)}))
      // _promises.push(Promise.race([
      //   new Promise((resolve, reject) => {this._queue[key].push(resolve)}),
      //   new Promise((resolve,reject) =>setTimeout(()=>{reject('time out*'), console.log('timer')},this._options.timeOut))
      // ]));
      if (!this._locked[key]) {
        this._dispatchNext(key);
      }
    }

    let _allPromises = Promise.all(_promises)//, this._cancelToken);


    return _allPromises;
  }

  runExclusive(key, callback) {
    return this
      .acquire(key)
      .then(async (release) => {
        let result;
        try {
          if (this._options.timeOut)
            result = cancellablePromise(new Promise(async (resolve) => {await callback(); resolve()}), this._cancelToken);
          else
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
    if (releases) {
      let r = [];
      if (Array.isArray(releases)) r = releases;
      else r.push(releases);
      for (let f of r) {
        f();
      }
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