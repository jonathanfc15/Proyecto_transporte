import { CapacidadInsuficienteError, RutaInexistenteError } from "./errores";
import { Grafo } from "./grafo";
import { Asignacion, Solicitud, Vehiculo } from "./modelos";

export function asignar_solicitudes(
  grafo: Grafo,
  solicitudes: Solicitud[],
  vehiculos: Vehiculo[],
): [Asignacion[], Solicitud[]] {
  const asignaciones: Asignacion[] = [];
  const pendientes: Solicitud[] = [];
  const libres = new Map(vehiculos.filter(v => v.disponible).map(v => [v.id, v]));
  const ordenadas = [...solicitudes].sort((a, b) => b.prioridad - a.prioridad || a.id.localeCompare(b.id));
  for (const solicitud of ordenadas) {
    let mejor: { total: number; vehiculo: Vehiculo; ruta: ReturnType<Grafo["ruta_minima"]> } | undefined;
    for (const vehiculo of libres.values()) {
      if (vehiculo.capacidad < solicitud.peso) continue;
      try {
        const recogida = grafo.ruta_minima(vehiculo.origen, solicitud.origen);
        const entrega = grafo.ruta_minima(solicitud.origen, solicitud.destino);
        const total = recogida.distancia + entrega.distancia;
        if (!mejor || total < mejor.total) mejor = { total, vehiculo, ruta: entrega };
      } catch (error) {
        if (!(error instanceof RutaInexistenteError)) throw error;
      }
    }
    if (!mejor) pendientes.push(solicitud);
    else {
      asignaciones.push(new Asignacion(solicitud, mejor.vehiculo, mejor.ruta));
      libres.delete(mejor.vehiculo.id);
    }
  }
  return [asignaciones, pendientes];
}

export function asignar_solicitud(grafo: Grafo, solicitud: Solicitud, vehiculos: Vehiculo[]): Asignacion {
  const [asignadas, pendientes] = asignar_solicitudes(grafo, [solicitud], vehiculos);
  if (pendientes.length) throw new CapacidadInsuficienteError(`No se pudo asignar ${solicitud.id}`);
  return asignadas[0];
}
