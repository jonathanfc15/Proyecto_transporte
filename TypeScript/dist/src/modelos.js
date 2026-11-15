"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resultado = exports.Asignacion = exports.Ruta = exports.Vehiculo = exports.Solicitud = exports.Arista = exports.Nodo = void 0;
const errores_1 = require("./errores");
class Nodo {
    id;
    nombre;
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
        if (!String(id).trim())
            throw new errores_1.ValidacionError("El identificador del nodo es obligatorio");
    }
}
exports.Nodo = Nodo;
class Arista {
    origen;
    destino;
    distancia;
    tiempo;
    bidireccional;
    constructor(origen, destino, distancia, tiempo, bidireccional = true) {
        this.origen = origen;
        this.destino = destino;
        this.distancia = distancia;
        this.tiempo = tiempo;
        this.bidireccional = bidireccional;
        if (!Number.isFinite(distancia) || distancia < errores_1.DISTANCIA_MINIMA)
            throw new errores_1.ValidacionError("La distancia no puede ser negativa");
        if (tiempo !== undefined && (!Number.isFinite(tiempo) || tiempo < 0))
            throw new errores_1.ValidacionError("El tiempo no puede ser negativo");
    }
}
exports.Arista = Arista;
class Solicitud {
    id;
    origen;
    destino;
    peso;
    prioridad;
    ventana_inicio;
    ventana_fin;
    constructor(id, origen, destino, peso = 0, prioridad = 0, ventana_inicio, ventana_fin) {
        this.id = id;
        this.origen = origen;
        this.destino = destino;
        this.peso = peso;
        this.prioridad = prioridad;
        this.ventana_inicio = ventana_inicio;
        this.ventana_fin = ventana_fin;
        if (!id || !origen || !destino)
            throw new errores_1.ValidacionError("La solicitud requiere id, origen y destino");
        if (!Number.isFinite(peso) || peso < 0)
            throw new errores_1.ValidacionError("El peso de la solicitud no puede ser negativo");
        if (ventana_inicio !== undefined && ventana_fin !== undefined && ventana_fin < ventana_inicio)
            throw new errores_1.ValidacionError("La ventana de tiempo es inválida");
    }
    get demanda() { return this.peso; }
}
exports.Solicitud = Solicitud;
class Vehiculo {
    id;
    origen;
    capacidad;
    velocidad;
    disponible;
    constructor(id, origen, capacidad, velocidad = 1, disponible = true) {
        this.id = id;
        this.origen = origen;
        this.capacidad = capacidad;
        this.velocidad = velocidad;
        this.disponible = disponible;
        if (!id || !origen)
            throw new errores_1.ValidacionError("El vehículo requiere id y origen");
        if (!Number.isFinite(capacidad) || capacidad < errores_1.CAPACIDAD_MINIMA)
            throw new errores_1.ValidacionError("La capacidad no puede ser negativa");
        if (!Number.isFinite(velocidad) || velocidad <= errores_1.VELOCIDAD_MINIMA)
            throw new errores_1.ValidacionError("La velocidad debe ser positiva");
    }
    get ubicacion() { return this.origen; }
}
exports.Vehiculo = Vehiculo;
class Ruta {
    nodos;
    distancia;
    tiempo;
    constructor(nodos, distancia, tiempo) {
        this.nodos = nodos;
        this.distancia = distancia;
        this.tiempo = tiempo;
    }
    get costo() { return this.distancia; }
    get origen() { return this.nodos[0]; }
    get destino() { return this.nodos[this.nodos.length - 1]; }
}
exports.Ruta = Ruta;
class Asignacion {
    solicitud;
    vehiculo;
    ruta;
    constructor(solicitud, vehiculo, ruta) {
        this.solicitud = solicitud;
        this.vehiculo = vehiculo;
        this.ruta = ruta;
    }
    get costo() { return this.ruta.costo; }
}
exports.Asignacion = Asignacion;
class Resultado {
    asignaciones;
    no_asignadas;
    distancia_total;
    tiempo_total;
    constructor(asignaciones = [], no_asignadas = [], distancia_total = 0, tiempo_total = 0) {
        this.asignaciones = asignaciones;
        this.no_asignadas = no_asignadas;
        this.distancia_total = distancia_total;
        this.tiempo_total = tiempo_total;
    }
    a_dict() {
        const plain = (value) => {
            if (Array.isArray(value))
                return value.map(plain);
            if (value && typeof value === "object") {
                return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
            }
            return value;
        };
        return {
            asignaciones: plain(this.asignaciones),
            no_asignadas: plain(this.no_asignadas),
            distancia_total: this.distancia_total,
            tiempo_total: this.tiempo_total,
        };
    }
}
exports.Resultado = Resultado;
//# sourceMappingURL=modelos.js.map