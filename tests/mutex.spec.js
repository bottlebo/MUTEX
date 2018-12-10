const {describe, it} = require('mocha');
const {assert} = require('chai');
const Mutex = require('../mutex')
function sleep(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
describe('Mutex tests', () => {
//
it('acquire with callback #1', function(done) {
  const mutex = new Mutex();
  let flag = false;

  mutex
    .acquire([2], async () => {await sleep(70); flag = true;});
  mutex
    .acquire([1], async () => {await sleep(50);assert.isFalse(flag); done()});

    assert.isTrue(mutex.isLocked(1));
    assert.isTrue(mutex.isLocked(2));
  
});

it('acquire with callback #2', function(done) {
  const mutex = new Mutex();
  let flag = 0;

  mutex
    .acquire([2, 1], async () => {await sleep(50); flag++;});

  mutex
    .acquire([2], async () => {await sleep(50);assert.equal(flag,1); flag++;});
  mutex
    .acquire([1], async () => {await sleep(60);assert.equal(flag,2); done()});

  assert.isTrue(mutex.isLocked(1));
  assert.isTrue(mutex.isLocked(2));

});

//
  it('callback #1', function(done) {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .acquire('1')
      .then(release => setTimeout(() => {
        flag = true;
        mutex.release(release);
      }, 100));

    mutex
      .acquire('1')
      .then((release) => {
        mutex.release(release);
        assert.isTrue(flag);
        done();
      });
  });

  it('callback #2', function(done) {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .acquire('1')
      .then(release => setTimeout(() => {
        flag = true;
        mutex.release(release);
      }, 100));

    mutex
      .acquire('2')
      .then((release) => {
        mutex.release(release);
        assert.isFalse(flag);
        done();
      });
  });

  
  it('callback #3', function(done) {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .acquire(['1','3'])
      .then(release => setTimeout(() => {
        flag = true;
        mutex.release(release);
      }, 100));

    mutex
      .acquire(['2','4'])
      .then((release) => {
        mutex.release(release);
        assert.isFalse(flag);
        done();
      });
  });


  it('callback #4', function(done) {
    const mutex = new Mutex();
    let flag = 0;

    mutex
      .acquire('1')
      .then(release => setTimeout(() => {
        flag++;
        mutex.release(release);
      }, 100));

    mutex
      .acquire('2')
      .then((release) => setTimeout(() => {
        flag++;
        mutex.release(release);
      }, 50));

    mutex
      .acquire(['1', '2'])
      .then((release) => {
        mutex.release(release);
        assert.equal(flag, 2);
        done();
      });
  });

  it('callback #5', function(done) {
    const mutex = new Mutex();
    let flag = 0;

    mutex
      .acquire('1')
      .then(release => setTimeout(() => {
        flag++;
        mutex.release(release);
      }, 100));

    mutex
      .acquire('2')
      .then(async (release) => {
        await sleep(50);
        flag++;
        mutex.release(release);
      });

    mutex
      .acquire(['1', '2'])
      .then((release) => {
        mutex.release(release);
        assert.equal(flag, 2);
        done();
      });
  });

  it('callback #5', function(done) {
    const mutex = new Mutex();
    let flag = 0;

    mutex
      .acquire('1')
      .then(release => setTimeout(() => {
        flag++;
        mutex.release(release);
      }, 100));

    mutex
      .acquire('2')
      .then((release) => setTimeout(() => {
        flag++;
        mutex.release(release);

      }, 100));

    mutex
      .acquire(['2', '1'])
      .then((release) => {
        mutex.release(release);
        assert.equal(flag, 2);
        done();
      });
  });

  it('runExclusive passes result (immediate)', function() {
    const mutex = new Mutex();
    mutex
      .runExclusive(1, () => 10)
      .then(value => assert.strictEqual(value, 10));
  });

  it('runExclusive passes result (promise)', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(1, () => Promise.resolve(10))
      .then(value => assert.strictEqual(value, 10));
  });

  it('runExclusive passes rejection', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(1, () => Promise.reject('foo'))
      .then(
        () => Promise.reject('should have been rejected'),
        value => assert.strictEqual(value, 'foo')
      );
  });

  it('runExclusive passes exception', function() {
    const mutex = new Mutex();

    mutex
      .runExclusive(1, () => {
        throw 'foo';
      })
      .then(
        () => Promise.reject('should have been rejected'),
        value => assert.strictEqual(value, 'foo')
      );
  });

  it('runExclusive #1', function(done) {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .runExclusive([2], async () => {await sleep(50); flag = true;});
    mutex
      .runExclusive([1], async () => {assert.isFalse(flag); done()});
  });

  it('runExclusive #2', function(done) {
    const mutex = new Mutex();
    let flag = false;

    mutex
      .runExclusive([2, 1], async () => {await sleep(50); flag = true;});

    mutex
      .runExclusive([2], async () => {assert.isTrue(flag); flag = false;});
    mutex
      .runExclusive([1], async () => {assert.isFalse(flag); done()});
  });

  it('runExclusive #3', function(done) {
    const mutex = new Mutex();
    let flag = 0;
    mutex
      .runExclusive([1], async () => {await sleep(50); flag++;}

      );
    mutex
      .runExclusive(2, async () => {await sleep(40); flag++}

      );
    mutex
      .runExclusive([2, 1], async () => {assert.equal(flag, 2); done();});
  });

  it('runExclusive #4', function(done) {
    const mutex = new Mutex();
    let flag = 0;
    mutex
      .runExclusive([1], async () => {await sleep(50); flag++;});
    mutex
      .runExclusive(2, async () => {await sleep(40); flag++});
    mutex
      .runExclusive([1, 2], async () => {assert.equal(flag, 2); done();});
  });

  it('runExclusive #5', function(done) {
    const mutex = new Mutex();
    let flag = false;
    mutex
      .runExclusive([1, 2], async () => {await sleep(50); flag=true;});
   
    mutex
      .runExclusive([3, 4], async () => {assert.isFalse(flag); done();});
  });

  
  it('runExclusive #6', function(done) {
    const mutex = new Mutex();
    let flag = false;
    mutex
      .runExclusive([1, 2], async () => {await sleep(50); flag=true;});
   
    mutex
      .runExclusive([1, 4], async () => {assert.isTrue(flag); done();});
  });

  it('runExclusive #7', function(done) {
    const mutex = new Mutex();
    let flag = 0;
    mutex
      .runExclusive([1], async () => {await sleep(50); flag++;});
    mutex
      .runExclusive(2, async () => {await sleep(40); flag++});
    mutex
      .runExclusive([2, 1, 3], async () => {assert.equal(flag, 2); done();});
  });

  it('exceptions during runExclusive do not leave mutex locked', function() {
    const mutex = new Mutex();

    let flag = false;

    mutex.runExclusive(1, () => {
      flag = true;
      throw new Error();
    })
      .then(() => undefined, () => undefined);

    mutex.runExclusive(1, () => {assert.isTrue(flag)});
  });

  it('await/release #1', async () => {
    const mutex = new Mutex();
    let flag = 0;
    const lock_1 = mutex.acquire([1]);
    const lock_2 = mutex.acquire(2);
    const lock_3 = mutex.acquire([1,2]);
    
    const releas_1 = await lock_1;
    await sleep(50);
    flag++;
    mutex.release(releas_1);
    
    const releas_2 = await lock_2;
    await sleep(50);
    flag++;
    mutex.release(releas_2);
    
    const releas_3 = await lock_3;
    await sleep(50);
    assert.equal(flag,2);
    mutex.release(releas_3);
  });

  it('isLocked reflects the mutex state', async () => {
    const mutex = new Mutex();
    const lock_1 = mutex.acquire([1, 2]);
    const lock_2 = mutex.acquire(2);

    assert.isTrue(mutex.isLocked(1));
    assert.isTrue(mutex.isLocked(2));

    const releas_1 = await lock_1;
    assert.isTrue(mutex.isLocked(1));
    mutex.release(releas_1)
    assert.isFalse(mutex.isLocked(1));
    assert.isTrue(mutex.isLocked(2));

    const releas_2 = await lock_2;

    assert.isTrue(mutex.isLocked(2));

    mutex.release(releas_2)
    assert.isFalse(mutex.isLocked(1));
    assert.isFalse(mutex.isLocked(2));

  });

});