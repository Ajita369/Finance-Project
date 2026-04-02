import { HTTP_STATUS, type ErrorCode } from "./constants";

/**
 * Custom application error that carries an HTTP status code and a typed
 * error code for structured API error responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode: ErrorCode,
    isOperational = true
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Static Factories ───────────────────────────────────────────────────────

  static badRequest(message: string, errorCode: ErrorCode): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errorCode);
  }

  static unauthorized(message: string, errorCode: ErrorCode): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, errorCode);
  }

  static forbidden(message: string, errorCode: ErrorCode): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, errorCode);
  }

  static notFound(message: string): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, "NOT_FOUND");
  }

  static conflict(message: string, errorCode: ErrorCode): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message, errorCode);
  }

  static unprocessable(message: string): ApiError {
    return new ApiError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message,
      "VALIDATION_ERROR"
    );
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      "INTERNAL_ERROR",
      false
    );
  }
}
