interface ErrorObj {
  message: string;
  status: number;
  code: string;
  details?: string | null;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly details?: string | null;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message = "Internal App Error",
    {
      status = 500,
      code = "INTERNAL_ERROR",
      details = null,
    }: Partial<ErrorObj> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
    this.code = code;
    this.isOperational = true; /// given error is operational or not?

    Error.captureStackTrace(this, this.constructor); /// Stack that start trace after this constructure not all track. it help better debugging.

    Object.setPrototypeOf(this, new.target.prototype); /// it return always true when i checked "instanceof"
  }
}

/// Bad request Error
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details: string | null = null) {
    super(message, { status: 400, code: "BAD_REQUEST", details });
  }
}

//// not found error

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found!", details: string | null = null) {
    super(message, { status: 404, code: "NOT_FOUND", details });
  }
}


/// 
export class UnAuthorizedError extends AppError{
    constructor(message: string = "Unauthorized", details: string | null = null){
        super(message, {status: 401, code:"UNAUTHORIZED", details})
    }
}

export class ForbiddenError extends AppError{

    constructor(message: string = "Forbidden", details: string | null = null){
        super(message, {status: 403, code: "FORBIDDEN", details})
    }

}

export class ConflictError extends AppError {
    constructor(message = "Conflict", details: string | null = null) {
        super(message, {status: 409, code: "CONFLICT", details});
    }
}

