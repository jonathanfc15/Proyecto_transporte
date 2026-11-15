import { asignar_solicitudes } from "./asignacion";
import { Grafo } from "./grafo";
import { Resultado, Solicitud, Vehiculo } from "./modelos";

export function procesar(grafo: Grafo, solicitudes: Solicitud[], vehiculos: Vehiculo[]): Resultado {
  const [asignaciones, pendientes] = asignar_solicitudes(grafo, solicitudes, vehiculos);
  return new Resultado(
    asignaciones,
    pendientes,
    asignaciones.reduce((total, a) => total + a.ruta.distancia, 0),
    asignaciones.reduce((total, a) => total + a.ruta.tiempo, 0),
  );
}

export class Procesador {
  constructor(public readonly grafo: Grafo) {}
  procesar(solicitudes: Solicitud[], vehiculos: Vehiculo[]): Resultado {
    return procesar(this.grafo, solicitudes, vehiculos);
  }
}
