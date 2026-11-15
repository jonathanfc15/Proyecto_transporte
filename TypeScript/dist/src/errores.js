"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudInexistenteError = exports.ValidacionError = exports.CapacidadInsuficienteError = exports.RutaInexistenteError = exports.NodoInexistenteError = exports.ErrorDatos = exports.ErrorTransporte = exports.VELOCIDAD_MINIMA = exports.CAPACIDAD_MINIMA = exports.DISTANCIA_MINIMA = void 0;
/** Excepciones del dominio de transporte. */
exports.DISTANCIA_MINIMA = 0;
exports.CAPACIDAD_MINIMA = 0;
exports.VELOCIDAD_MINIMA = 0;
class ErrorTransporte extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ErrorTransporte = ErrorTransporte;
class ErrorDatos extends ErrorTransporte {
}
exports.ErrorDatos = ErrorDatos;
class NodoInexistenteError extends ErrorTransporte {
}
exports.NodoInexistenteError = NodoInexistenteError;
class RutaInexistenteError extends ErrorTransporte {
}
exports.RutaInexistenteError = RutaInexistenteError;
class CapacidadInsuficienteError extends ErrorTransporte {
}
exports.CapacidadInsuficienteError = CapacidadInsuficienteError;
class ValidacionError extends ErrorDatos {
}
exports.ValidacionError = ValidacionError;
class SolicitudInexistenteError extends ErrorTransporte {
}
exports.SolicitudInexistenteError = SolicitudInexistenteError;
//# sourceMappingURL=errores.js.map