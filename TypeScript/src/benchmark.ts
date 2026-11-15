import { performance } from "node:perf_hooks";
import { cargar_grafo, cargar_solicitudes, cargar_vehiculos } from "./ioDatos";
import { procesar } from "./procesador";

export function benchmark(red: string, solicitudes: string, vehiculos: string): Record<string, unknown> {
  const inicio = performance.now();
  const resultado = procesar(cargar_grafo(red), cargar_solicitudes(solicitudes), cargar_vehiculos(vehiculos));
  return {
    solicitudes: resultado.asignaciones.length + resultado.no_asignadas.length,
    asignadas: resultado.asignaciones.length,
    no_asignadas: resultado.no_asignadas.length,
    distancia_total: resultado.distancia_total,
    tiempo_total: resultado.tiempo_total,
    tiempo_ms: performance.now() - inicio,
  };
}
