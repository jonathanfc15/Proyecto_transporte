import { Grafo } from "./grafo";
import { Ruta } from "./modelos";
export declare function calcular_ruta(grafo: Grafo, origen: string, destino: string): Ruta;
export declare function calcular_rutas(grafo: Grafo, pares: Array<[string, string]>): Ruta[];
export declare const ruta_mas_corta: typeof calcular_ruta;
