/** Excepciones del dominio de transporte. */
export declare const DISTANCIA_MINIMA = 0;
export declare const CAPACIDAD_MINIMA = 0;
export declare const VELOCIDAD_MINIMA = 0;
export declare class ErrorTransporte extends Error {
    constructor(message: string);
}
export declare class ErrorDatos extends ErrorTransporte {
}
export declare class NodoInexistenteError extends ErrorTransporte {
}
export declare class RutaInexistenteError extends ErrorTransporte {
}
export declare class CapacidadInsuficienteError extends ErrorTransporte {
}
export declare class ValidacionError extends ErrorDatos {
}
export declare class SolicitudInexistenteError extends ErrorTransporte {
}
