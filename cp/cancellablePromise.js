const CancelError = require('./CancelError')

const cancellablePromise = (initialPromise, cancelToken) => {
  if(!cancelToken) {
    return initialPromise
  }

  if(cancelToken.cancelled) {
    return Promise.reject(new CancelError('time out'))
  }

  return Promise.race([
    initialPromise,
    cancelToken.promise
  ])
}

module.exports = cancellablePromise
