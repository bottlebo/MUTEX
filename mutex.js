class Mutex {
  constructor() {
    this._locked = false;
    this._queue = [];
  }
  get isLocked() {
    return this._locked;
  }
  acquire() {
    const ticket = new Promise(resolve => this._queue.push(resolve));
    if (!this._locked) {
      this._dispatchNext();
    }

    return ticket;
  }
  runExclusive(callback) {
    return this
      .acquire()
      .then(release => {
        let result;

        try {
          result = callback();
        } catch (e) {
          release();
          throw (e);
        }

        return Promise
          .resolve(result)
          .then((x) => (release(), x),
            e => {release(); throw e;}
          );
      });
  }

  _dispatchNext() {
    if (this._queue.length > 0) {
      this._locked = true;
      const resolve = this._queue.shift();
      if (resolve) {
        resolve(this._dispatchNext.bind(this));
      }
    } else {
      this._locked = false;
    }
  }
}
module.exports = Mutex;