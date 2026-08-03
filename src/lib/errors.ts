export class AuctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuctionError";
  }
}

export class AuthError extends Error {
  constructor(message: string = "No autenticado") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "No autorizado") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Recurso no encontrado") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Demasiadas solicitudes, intenta más tarde") {
    super(message);
    this.name = "RateLimitError";
  }
}

interface ErrorResult {
  success: false;
  error: string;
}

export function handleActionError(error: unknown): ErrorResult {
  if (error instanceof AuctionError || error instanceof ValidationError) {
    return { success: false, error: error.message };
  }

  if (error instanceof AuthError) {
    return { success: false, error: error.message };
  }

  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message };
  }

  if (error instanceof NotFoundError) {
    return { success: false, error: error.message };
  }

  if (error instanceof RateLimitError) {
    return { success: false, error: error.message };
  }

  return { success: false, error: "Error interno del servidor" };
}
