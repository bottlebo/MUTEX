const {describe, it} = require('mocha');
const {assert} = require('chai');
const Mutex = require('../mutex')
describe('Mutex tests', () => {


  it('ownership is exclusive', function() {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .acquire()
      .then(release => setTimeout(() => {
        flag = true;
        release();
      }, 100));

    mutex
      .acquire()
      .then((release) => {
        release();
        assert.isTrue(flag);
      });
  });

  it('runExclusive passes result (immediate)', function() {
    const mutex = new Mutex();
    mutex
      .runExclusive(() => 10)
      .then(value => assert.strictEqual(value, 10));
  });

  it('runExclusive passes result (promise)', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(() => Promise.resolve(10))
      .then(value => assert.strictEqual(value, 10));
  });

  it('runExclusive passes rejection', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(() => Promise.reject('foo'))
      .then(
        () => Promise.reject('should have been rejected'),
        value => assert.strictEqual(value, 'foo')
      );
  });

  it('runExclusive passes exception', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(() => {
        throw 'foo';
      })
      .then(
        () => Promise.reject('should have been rejected'),
        value => assert.strictEqual(value, 'foo')
      );
  });

  it('runExclusive is exclusive', function() {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .runExclusive(() => new Promise(
        resolve => setTimeout(
          () => {
            flag = true;
            resolve();
          }, 50
        )
      ));

    mutex.runExclusive(() => assert.isTrue(flag));
  });

  it('exceptions during runExclusive do not leave mutex locked', function() {
    const mutex = new Mutex();

    let flag = false;

    mutex.runExclusive(() => {
      flag = true;
      throw new Error();
    })
      .then(() => undefined, () => undefined);

    mutex.runExclusive(() => assert.isTrue(flag));
  });

  it('isLocked reflects the mutex state', async () => {
    const mutex = new Mutex();
    const lock_1 = mutex.acquire();
    const lock_2 = mutex.acquire();

    assert.isTrue(mutex.isLocked);
    const releas_1 = await lock_1;
    assert.isTrue(mutex.isLocked);
    releas_1()
    assert.isTrue(mutex.isLocked);

    const releas_2 = await lock_2;

    assert.isTrue(mutex.isLocked);

    releas_2();
    assert.isFalse(mutex.isLocked);
  });
});