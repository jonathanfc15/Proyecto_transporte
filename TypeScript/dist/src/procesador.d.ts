import { Grafo } from "./grafo";
import { Resultado, Solicitud, Vehiculo } from "./modelos";
export declare function procesar(grafo: Grafo, solicitudes: Solicitud[], vehiculos: Vehiculo[]): Resultado;
export declare class Procesador {
    readonly grafo: Grafo;
    constructor(grafo: Grafo);
    procesar(solicitudes: Solicitud[], vehiculos: Vehiculo[]): Resultado;
}
