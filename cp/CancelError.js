class CancelError extends Error {
  constructor(message) {
    super(message)
    this.name = 'Promise Cancel'
  }
}

module.exports = CancelError;
