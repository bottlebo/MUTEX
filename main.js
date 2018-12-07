const Mutex = require('./mutex')
function sleep(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}
async function start() {
  let r1,r2,r3
  let p1 = new Promise((resolve,reject) =>{
    r1=reject;
    setTimeout(()=>{console.log('1');resolve(1)},100)
  })
  let p2 = new Promise((resolve,reject) =>{
    r2=reject;
    setTimeout(()=>{console.log('2');resolve(2)},200)
  })
  let p3 = new Promise((resolve,reject) =>{
    r3=reject;
    setTimeout(()=>{console.log('3');resolve(3)},300)
  })
  let pr = new Promise((resolve,reject) =>{
    setTimeout(()=>{reject('rej')},110)
  })
  Promise.race([Promise.all([p1,p2,p3]) ,pr]).then((r)=>console.log('res:'+r),(e)=>{console.log('err:'+e); r1();r2();r3()})
  /* const mutex = new Mutex();
  let flag = 0;
  const lock_1 = mutex.acquire(1);
  const lock_2 = mutex.acquire(1);
  //const lock_3 = mutex.acquire([1,2]);

  const releas_1 = await lock_1;
  try {
    await sleep(150);
    flag++;
    console.log('5')
    //console.log(releas_1)
    mutex.release(releas_1);
  }
  catch (e) {
    console.log(e)
  }
  const releas_2 = await lock_2;
  try {
    await sleep(1150);
    flag++;
    console.log('52')
    mutex.release(releas_2);
  }
  catch (e) {
    console.log(e)
  } */
}
start()
