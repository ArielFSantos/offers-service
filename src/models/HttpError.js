export default class HttpError extends Error {
  constructor(message, errorCode, status) {
    super(message);
    this.code = errorCode;
    this.status = status;
  }
}
