"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmark = benchmark;
const node_perf_hooks_1 = require("node:perf_hooks");
const ioDatos_1 = require("./ioDatos");
const procesador_1 = require("./procesador");
function benchmark(red, solicitudes, vehiculos) {
    const inicio = node_perf_hooks_1.performance.now();
    const resultado = (0, procesador_1.procesar)((0, ioDatos_1.cargar_grafo)(red), (0, ioDatos_1.cargar_solicitudes)(solicitudes), (0, ioDatos_1.cargar_vehiculos)(vehiculos));
    return {
        solicitudes: resultado.asignaciones.length + resultado.no_asignadas.length,
        asignadas: resultado.asignaciones.length,
        no_asignadas: resultado.no_asignadas.length,
        distancia_total: resultado.distancia_total,
        tiempo_total: resultado.tiempo_total,
        tiempo_ms: node_perf_hooks_1.performance.now() - inicio,
    };
}
//# sourceMappingURL=benchmark.js.map