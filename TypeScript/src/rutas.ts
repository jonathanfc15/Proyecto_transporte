import { Grafo } from "./grafo";
import { Ruta } from "./modelos";

export function calcular_ruta(grafo: Grafo, origen: string, destino: string): Ruta {
  return grafo.ruta_minima(origen, destino);
}
export function calcular_rutas(grafo: Grafo, pares: Array<[string, string]>): Ruta[] {
  return pares.map(([origen, destino]) => calcular_ruta(grafo, origen, destino));
}
export const ruta_mas_corta = calcular_ruta;
