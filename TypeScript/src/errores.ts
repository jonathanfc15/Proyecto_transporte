/** Excepciones del dominio de transporte. */
export const DISTANCIA_MINIMA = 0;
export const CAPACIDAD_MINIMA = 0;
export const VELOCIDAD_MINIMA = 0;

export class ErrorTransporte extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class ErrorDatos extends ErrorTransporte {}
export class NodoInexistenteError extends ErrorTransporte {}
export class RutaInexistenteError extends ErrorTransporte {}
export class CapacidadInsuficienteError extends ErrorTransporte {}
export class ValidacionError extends ErrorDatos {}
export class SolicitudInexistenteError extends ErrorTransporte {}
