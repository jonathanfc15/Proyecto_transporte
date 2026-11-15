import { Grafo } from "./grafo";
import { Asignacion, Solicitud, Vehiculo } from "./modelos";
export declare function asignar_solicitudes(grafo: Grafo, solicitudes: Solicitud[], vehiculos: Vehiculo[]): [Asignacion[], Solicitud[]];
export declare function asignar_solicitud(grafo: Grafo, solicitud: Solicitud, vehiculos: Vehiculo[]): Asignacion;
