"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leer_vehiculos = exports.leer_solicitudes = exports.leer_red = exports.leer_json = void 0;
exports.cargar_json = cargar_json;
exports.cargar_grafo = cargar_grafo;
exports.cargar_solicitudes = cargar_solicitudes;
exports.cargar_vehiculos = cargar_vehiculos;
exports.guardar_json = guardar_json;
const node_fs_1 = require("node:fs");
const errores_1 = require("./errores");
const grafo_1 = require("./grafo");
const modelos_1 = require("./modelos");
function cargar_json(ruta) {
    try {
        return JSON.parse((0, node_fs_1.readFileSync)(ruta, "utf8"));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new errores_1.ErrorDatos(`No se pudo leer ${ruta}: ${message}`);
    }
}
function lista(datos, claves) {
    if (Array.isArray(datos))
        return datos;
    if (datos && typeof datos === "object") {
        for (const clave of claves) {
            const value = datos[clave];
            if (Array.isArray(value))
                return value;
        }
    }
    throw new errores_1.ErrorDatos("Se esperaba una lista de datos");
}
function cargar_grafo(ruta) {
    const datos = cargar_json(ruta);
    const grafo = new grafo_1.Grafo();
    if (datos && typeof datos === "object" && Array.isArray(datos.nodos)) {
        for (const nodo of datos.nodos)
            grafo.agregar_nodo(typeof nodo === "string" ? nodo : nodo.id);
    }
    for (const raw of lista(datos, ["aristas", "conexiones", "rutas", "edges"])) {
        const item = raw;
        const origen = item.origen ?? item.desde ?? item.from;
        const destino = item.destino ?? item.hasta ?? item.to;
        const distancia = item.distancia ?? item.peso ?? item.weight;
        if (origen === undefined || destino === undefined || distancia === undefined)
            throw new errores_1.ErrorDatos("Arista incompleta");
        const bidireccional = item.bidireccional === undefined ? !Boolean(item.dirigida) : Boolean(item.bidireccional);
        grafo.agregar_arista(new modelos_1.Arista(String(origen), String(destino), Number(distancia), item.tiempo == null ? undefined : Number(item.tiempo), bidireccional));
    }
    return grafo;
}
function cargar_solicitudes(ruta) {
    return lista(cargar_json(ruta), ["solicitudes", "pedidos"]).map((raw, i) => {
        const x = raw;
        return new modelos_1.Solicitud(String(x.id ?? i), String(x.origen ?? x.desde), String(x.destino ?? x.hasta), Number(x.peso ?? x.demanda ?? 0), Number(x.prioridad ?? 0), x.ventana_inicio, x.ventana_fin);
    });
}
function cargar_vehiculos(ruta) {
    return lista(cargar_json(ruta), ["vehiculos", "vehículos"]).map((raw, i) => {
        const x = raw;
        return new modelos_1.Vehiculo(String(x.id ?? i), String(x.origen ?? x.ubicacion ?? ""), Number(x.capacidad), Number(x.velocidad ?? 1), Boolean(x.disponible ?? true));
    });
}
function guardar_json(ruta, datos) {
    (0, node_fs_1.writeFileSync)(ruta, JSON.stringify(datos, null, 2), "utf8");
}
exports.leer_json = cargar_json;
exports.leer_red = cargar_grafo;
exports.leer_solicitudes = cargar_solicitudes;
exports.leer_vehiculos = cargar_vehiculos;
//# sourceMappingURL=ioDatos.js.map