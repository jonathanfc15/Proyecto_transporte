"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Procesador = void 0;
exports.procesar = procesar;
const asignacion_1 = require("./asignacion");
const modelos_1 = require("./modelos");
function procesar(grafo, solicitudes, vehiculos) {
    const [asignaciones, pendientes] = (0, asignacion_1.asignar_solicitudes)(grafo, solicitudes, vehiculos);
    return new modelos_1.Resultado(asignaciones, pendientes, asignaciones.reduce((total, a) => total + a.ruta.distancia, 0), asignaciones.reduce((total, a) => total + a.ruta.tiempo, 0));
}
class Procesador {
    grafo;
    constructor(grafo) {
        this.grafo = grafo;
    }
    procesar(solicitudes, vehiculos) {
        return procesar(this.grafo, solicitudes, vehiculos);
    }
}
exports.Procesador = Procesador;
//# sourceMappingURL=procesador.js.map