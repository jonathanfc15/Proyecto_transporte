"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const grafo_1 = require("../src/grafo");
const modelos_1 = require("../src/modelos");
const procesador_1 = require("../src/procesador");
const errores_1 = require("../src/errores");
(0, node_test_1.default)("calcula la ruta mínima y el tiempo", () => {
    const grafo = new grafo_1.Grafo();
    grafo.agregar_conexion("A", "B", 4, 2);
    grafo.agregar_conexion("B", "C", 3, 5);
    const ruta = grafo.ruta_minima("A", "C");
    strict_1.default.deepEqual(ruta.nodos, ["A", "B", "C"]);
    strict_1.default.equal(ruta.distancia, 7);
    strict_1.default.equal(ruta.tiempo, 7);
});
(0, node_test_1.default)("asigna una solicitud y conserva pendientes", () => {
    const grafo = new grafo_1.Grafo();
    grafo.agregar_conexion("A", "B", 4);
    grafo.agregar_conexion("B", "C", 3);
    const resultado = (0, procesador_1.procesar)(grafo, [
        new modelos_1.Solicitud("1", "A", "C", 5),
        new modelos_1.Solicitud("2", "A", "C", 8),
    ], [new modelos_1.Vehiculo("V1", "A", 5)]);
    strict_1.default.equal(resultado.asignaciones.length, 1);
    strict_1.default.equal(resultado.no_asignadas.length, 1);
});
(0, node_test_1.default)("valida datos y rutas inexistentes", () => {
    strict_1.default.throws(() => new modelos_1.Vehiculo("", "A", 1), errores_1.ValidacionError);
    const grafo = new grafo_1.Grafo();
    grafo.agregar_nodo("A");
    strict_1.default.throws(() => grafo.ruta_minima("A", "B"), errores_1.NodoInexistenteError);
    grafo.agregar_nodo("B");
    strict_1.default.throws(() => grafo.ruta_minima("A", "B"), errores_1.RutaInexistenteError);
});
//# sourceMappingURL=transporte.test.js.map