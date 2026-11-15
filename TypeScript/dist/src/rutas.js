"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruta_mas_corta = void 0;
exports.calcular_ruta = calcular_ruta;
exports.calcular_rutas = calcular_rutas;
function calcular_ruta(grafo, origen, destino) {
    return grafo.ruta_minima(origen, destino);
}
function calcular_rutas(grafo, pares) {
    return pares.map(([origen, destino]) => calcular_ruta(grafo, origen, destino));
}
exports.ruta_mas_corta = calcular_ruta;
//# sourceMappingURL=rutas.js.map