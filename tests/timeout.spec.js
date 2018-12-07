const {describe, it} = require('mocha');
const {assert} = require('chai');
const Mutex = require('../mutex')
function sleep(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
describe('Mutex timeout tests', () => {
  
    it('runExclusive  timer: nothing is done', async function() {
      const mutex = new Mutex({timeOut: 90});
      let flag = 0;
      mutex
        .runExclusive([1], async () => {
          await sleep(150);
          flag++;
        })
        .then(
          () => {assert.equal(flag, 1);},
          (e) => {assert.equal(flag, 0); console.log('error 1:' + e)});
      mutex
        .runExclusive(1, async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 2);},
          (e) => {console.log('error 2:' + e); assert.equal(flag, 0)});
  
      mutex
        .runExclusive([1], async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 3);},
          (e) => {assert.equal(flag, 0);console.log('error 3:' + e);});
      await sleep(1000)
  
    });
  
    it('runExclusive timer: exec first promise', async function() {
      const mutex = new Mutex({timeOut: 70});
      let flag = 0;
  
      mutex
        .runExclusive([1], async () => {
          await sleep(50);
          flag++;
        })
        .then(
          () => {assert.equal(flag, 1);},
          (e) => {assert.equal(flag, 0); console.log('error 1:' + e)}
        );
  
      mutex
        .runExclusive(1, async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 2);},
          (e) => {console.log('error 2:' + e); assert.equal(flag, 1)}
        );
  
      mutex
        .runExclusive([1, 2], async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 3);},
          (e) => {console.log('error 3:' + e); assert.equal(flag, 1)}
        );
      await sleep(1000)
  
    });
  
    it('runExclusive timer: exec first&second promises', async function() {
      const mutex = new Mutex({timeOut: 110});
      let flag = 0;
  
      mutex
        .runExclusive([1], async () => {
          await sleep(50);
          flag++;
        })
        .then(
          () => {assert.equal(flag, 1);},
          (e) => {assert.equal(flag, 0); console.log('error 1:' + e)}
        );
  
      mutex
        .runExclusive(1, async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 2);},
          (e) => {console.log('error 2:' + e); assert.equal(flag, 2)}
        );
  
      mutex
        .runExclusive([1, 2], async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 3);},
          (e) => {console.log('error 3:' + e); assert.equal(flag, 2)}
        );
      await sleep(1000)
  
    });
  
    it('runExclusive timer: exec all', async function() {
      const mutex = new Mutex({timeOut: 160});
      let flag = 0;
  
      mutex
        .runExclusive([1], async () => {
          await sleep(50);
          flag++;
        })
        .then(
          () => {assert.equal(flag, 1);},
          (e) => {assert.equal(flag, 0); console.log('error 1:' + e)}
        );
  
      mutex
        .runExclusive(1, async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 2);},
          (e) => {console.log('error 2:' + e); assert.equal(flag, 2)}
        );
  
      mutex
        .runExclusive([1, 2], async () => {
          await sleep(50);
          flag++
        })
        .then(
          () => {assert.equal(flag, 3);},
          (e) => {console.log('error 3:' + e); assert.equal(flag, 2)}
        );
      await sleep(1000)
  
    });
    
  });