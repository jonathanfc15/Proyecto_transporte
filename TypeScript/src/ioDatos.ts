import { readFileSync, writeFileSync } from "node:fs";
import { ErrorDatos } from "./errores";
import { Grafo } from "./grafo";
import { Arista, Solicitud, Vehiculo } from "./modelos";

export function cargar_json(ruta: string): unknown {
  try { return JSON.parse(readFileSync(ruta, "utf8")); }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ErrorDatos(`No se pudo leer ${ruta}: ${message}`);
  }
}

function lista(datos: unknown, claves: string[]): unknown[] {
  if (Array.isArray(datos)) return datos;
  if (datos && typeof datos === "object") {
    for (const clave of claves) {
      const value = (datos as Record<string, unknown>)[clave];
      if (Array.isArray(value)) return value;
    }
  }
  throw new ErrorDatos("Se esperaba una lista de datos");
}

export function cargar_grafo(ruta: string): Grafo {
  const datos = cargar_json(ruta);
  const grafo = new Grafo();
  if (datos && typeof datos === "object") {
    const objeto = datos as Record<string, any>;
    const ubicaciones = Array.isArray(objeto.ubicaciones) ? objeto.ubicaciones : objeto.nodos;
    if (Array.isArray(ubicaciones)) {
      for (const nodo of ubicaciones) grafo.agregar_nodo(typeof nodo === "string" ? nodo : nodo.id);
    }
  }
  for (const raw of lista(datos, ["conexiones", "aristas", "rutas", "edges"])) {
    const item = raw as Record<string, any>;
    const origen = item.origen ?? item.desde ?? item.from;
    const destino = item.destino ?? item.hasta ?? item.to;
    const distancia = item.distancia_km ?? item.distancia ?? item.peso ?? item.weight;
    const tiempo = item.tiempo_base_min ?? item.tiempo;
    const costo = item.costo;
    if (origen === undefined || destino === undefined || distancia === undefined) throw new ErrorDatos("Arista incompleta");
    const bidireccional = item.bidireccional === undefined ? !Boolean(item.dirigida) : Boolean(item.bidireccional);
    grafo.agregar_arista(new Arista(String(origen), String(destino), Number(distancia),
      tiempo == null ? undefined : Number(tiempo), bidireccional, Number(costo ?? 0)));
  }
  return grafo;
}

export function cargar_solicitudes(ruta: string): Solicitud[] {
  return lista(cargar_json(ruta), ["solicitudes", "pedidos"]).map((raw, i) => {
    const x = raw as Record<string, any>;
    const prioridad = typeof x.prioridad === "string"
      ? {critica: 4, alta: 3, media: 2, baja: 1}[x.prioridad] ?? 0
      : Number(x.prioridad ?? 0);
    return new Solicitud(String(x.id ?? i), String(x.origen ?? x.desde), String(x.destino ?? x.hasta),
      Number(x.peso ?? x.pasajeros ?? x.demanda ?? 0), prioridad, x.ventana_inicio, x.ventana_fin);
  });
}

export function cargar_vehiculos(ruta: string): Vehiculo[] {
  return lista(cargar_json(ruta), ["vehiculos", "vehículos"]).map((raw, i) => {
    const x = raw as Record<string, any>;
    const disponible = x.estado === undefined
      ? Boolean(x.disponible ?? true)
      : x.estado === "disponible";
    return new Vehiculo(String(x.id ?? i), String(x.origen ?? x.ubicacion ?? "A"), Number(x.capacidad),
      Number(x.velocidad ?? 1), disponible);
  });
}

export function guardar_json(ruta: string, datos: unknown): void {
  writeFileSync(ruta, JSON.stringify(datos, null, 2), "utf8");
}
export const leer_json = cargar_json;
export const leer_red = cargar_grafo;
export const leer_solicitudes = cargar_solicitudes;
export const leer_vehiculos = cargar_vehiculos;
