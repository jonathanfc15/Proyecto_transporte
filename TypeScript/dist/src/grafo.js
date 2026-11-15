"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grafo = void 0;
const errores_1 = require("./errores");
const modelos_1 = require("./modelos");
class Grafo {
    adyacencia = new Map();
    get nodos() { return new Set(this.adyacencia.keys()); }
    agregar_nodo(nodo) {
        const id = typeof nodo === "string" ? nodo : nodo.id;
        if (!this.adyacencia.has(id))
            this.adyacencia.set(id, []);
    }
    agregar_arista(arista, destino, distancia) {
        const edge = arista instanceof modelos_1.Arista
            ? arista
            : new modelos_1.Arista(String(arista), String(destino), distancia ?? 0);
        this.agregar_nodo(edge.origen);
        this.agregar_nodo(edge.destino);
        this.adyacencia.get(edge.origen).push(edge);
        if (edge.bidireccional) {
            this.adyacencia.get(edge.destino).push(new modelos_1.Arista(edge.destino, edge.origen, edge.distancia, edge.tiempo, false));
        }
    }
    agregar_conexion(origen, destino, distancia, tiempo, bidireccional = true) {
        this.agregar_arista(new modelos_1.Arista(origen, destino, distancia, tiempo, bidireccional));
    }
    vecinos(nodo) {
        if (!this.adyacencia.has(nodo))
            throw new errores_1.NodoInexistenteError(`Nodo inexistente: ${nodo}`);
        return [...this.adyacencia.get(nodo)];
    }
    ruta_minima(origen, destino) {
        if (!this.adyacencia.has(origen) || !this.adyacencia.has(destino))
            throw new errores_1.NodoInexistenteError(`Nodo inexistente: ${origen} o ${destino}`);
        const cola = [[0, origen]];
        const dist = new Map([[origen, 0]]);
        const anterior = new Map();
        while (cola.length) {
            cola.sort((a, b) => a[0] - b[0]);
            const [costo, actual] = cola.shift();
            if (costo !== dist.get(actual))
                continue;
            if (actual === destino)
                break;
            for (const arista of this.adyacencia.get(actual)) {
                const nuevo = costo + arista.distancia;
                if (nuevo < (dist.get(arista.destino) ?? Infinity)) {
                    dist.set(arista.destino, nuevo);
                    anterior.set(arista.destino, [actual, arista]);
                    cola.push([nuevo, arista.destino]);
                }
            }
        }
        if (!dist.has(destino))
            throw new errores_1.RutaInexistenteError(`No existe ruta de ${origen} a ${destino}`);
        const nodos = [destino];
        let actual = destino;
        let tiempo = 0;
        while (actual !== origen) {
            const previo = anterior.get(actual);
            if (!previo)
                throw new errores_1.RutaInexistenteError(`No existe ruta de ${origen} a ${destino}`);
            const [p, arista] = previo;
            nodos.push(p);
            tiempo += arista.tiempo ?? arista.distancia;
            actual = p;
        }
        return new modelos_1.Ruta(nodos.reverse(), dist.get(destino), tiempo);
    }
    camino_minimo(origen, destino) { return this.ruta_minima(origen, destino); }
    dijkstra(origen, destino) { return this.ruta_minima(origen, destino); }
}
exports.Grafo = Grafo;
//# sourceMappingURL=grafo.js.map