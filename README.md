### Usage

```javascript
    const mutex = new Mutex();
```

#### runExclusive

```javascript
  mutex
    .runExclusive([key1,key2,...], function() {
        // ...
    })
    .then(function(result) {
        // ...
    });
```

##### Async function example

```javascript
await mutex.runExclusive([key1,key2,...], async () => {
    const i = await store.get();
    await store.put(i + 1);
});
```

#### Callback example

```javascript
  mutex
    .acquire([key1,key2,...])
    .then(function(lock) {
        // ...
        mutex.release(lock);
    });

```
#### Async example

```javascript
const lock = await mutex.acquire([key1,key2,...]);
try {
    const i = await store.get();
    await store.put(i + 1);
} finally {
    mutex.release(lock);
}
```

#### Checking whether the mutex is locked

```javascript
mutex.isLocked(key);
```

#### TimeOut example

```javascript
const mutex = new Mutex({timeOut: 160});

 mutex
  .runExclusive([1], async () => {
    await sleep(50);
    //...
  })
  .then(
    (result) => {// ok},
    (e) => { // e.message = time our}
  );
```