"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asignar_solicitudes = asignar_solicitudes;
exports.asignar_solicitud = asignar_solicitud;
const errores_1 = require("./errores");
const modelos_1 = require("./modelos");
function asignar_solicitudes(grafo, solicitudes, vehiculos) {
    const asignaciones = [];
    const pendientes = [];
    const libres = new Map(vehiculos.filter(v => v.disponible).map(v => [v.id, v]));
    const ordenadas = [...solicitudes].sort((a, b) => b.prioridad - a.prioridad || a.id.localeCompare(b.id));
    for (const solicitud of ordenadas) {
        let mejor;
        for (const vehiculo of libres.values()) {
            if (vehiculo.capacidad < solicitud.peso)
                continue;
            try {
                const recogida = grafo.ruta_minima(vehiculo.origen, solicitud.origen);
                const entrega = grafo.ruta_minima(solicitud.origen, solicitud.destino);
                const total = recogida.distancia + entrega.distancia;
                if (!mejor || total < mejor.total)
                    mejor = { total, vehiculo, ruta: entrega };
            }
            catch (error) {
                if (!(error instanceof errores_1.RutaInexistenteError))
                    throw error;
            }
        }
        if (!mejor)
            pendientes.push(solicitud);
        else {
            asignaciones.push(new modelos_1.Asignacion(solicitud, mejor.vehiculo, mejor.ruta));
            libres.delete(mejor.vehiculo.id);
        }
    }
    return [asignaciones, pendientes];
}
function asignar_solicitud(grafo, solicitud, vehiculos) {
    const [asignadas, pendientes] = asignar_solicitudes(grafo, [solicitud], vehiculos);
    if (pendientes.length)
        throw new errores_1.CapacidadInsuficienteError(`No se pudo asignar ${solicitud.id}`);
    return asignadas[0];
}
//# sourceMappingURL=asignacion.js.map