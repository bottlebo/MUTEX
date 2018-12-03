### Usage

```javascript
    const mutex = new Mutex();
```

#### Locking

```javascript
  mutex
    .acquire()
    .then(function(release) {
        // ...
    });

```
##### Async function example

```javascript
const release = await mutex.acquire();
try {
    const i = await store.get();
    await store.put(i + 1);
} finally {
    release();
}
```

#### Synchronized code execution

```javascript
  mutex
    .runExclusive(function() {
        // ...
    })
    .then(function(result) {
        // ...
    });
```

##### Async function example

```javascript
await mutex.runExclusive(async () => {
    const i = await store.get();
    await store.put(i + 1);
});
```

#### Checking whether the mutex is locked

```javascript
mutex.isLocked();
```