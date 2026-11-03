import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map(({ path, message }) => ({
        field: path.join("."), message
      }))
    });
  }

  const status = err.statusCode || 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : err.message
  });
}
