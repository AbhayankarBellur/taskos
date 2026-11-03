export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const badRequest = (message) => new AppError(400, message);
export const unauthorized = (message = "Authentication required") =>
  new AppError(401, message);
export const forbidden = (message = "Forbidden") => new AppError(403, message);
export const notFound = (label = "Resource") =>
  new AppError(404, `${label} not found`);
export const conflict = (message) => new AppError(409, message);

export const isDuplicateKey = (error) => error?.code === 11000;
