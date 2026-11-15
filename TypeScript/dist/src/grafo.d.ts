import { Arista, Nodo, Ruta } from "./modelos";
export declare class Grafo {
    readonly adyacencia: Map<string, Arista[]>;
    get nodos(): Set<string>;
    agregar_nodo(nodo: Nodo | string): void;
    agregar_arista(arista: Arista, destino?: string, distancia?: number): void;
    agregar_conexion(origen: string, destino: string, distancia: number, tiempo?: number, bidireccional?: boolean): void;
    vecinos(nodo: string): Arista[];
    ruta_minima(origen: string, destino: string): Ruta;
    camino_minimo(origen: string, destino: string): Ruta;
    dijkstra(origen: string, destino: string): Ruta;
}
