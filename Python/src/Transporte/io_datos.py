import json
from pathlib import Path
from typing import Any
from .errores import ErrorDatos
from .grafo import Grafo
from .modelos import Conexion, Solicitud, Ubicacion, Vehiculo


def cargar_json(ruta: str | Path) -> Any:
    try:
        with Path(ruta).open(encoding="utf-8") as archivo:
            return json.load(archivo)
    except (OSError, json.JSONDecodeError) as exc:
        raise ErrorDatos(f"No se pudo leer {ruta}: {exc}") from exc


def _lista(datos: Any, claves: tuple[str, ...]) -> list:
    if isinstance(datos, list):
        return datos
    for clave in claves:
        if isinstance(datos, dict) and isinstance(datos.get(clave), list):
            return datos[clave]
    raise ErrorDatos("Se esperaba una lista de datos")


def cargar_grafo(ruta: str | Path) -> Grafo:
    datos = cargar_json(ruta)
    grafo = Grafo()
    ubicaciones = _lista(datos, ("ubicaciones", "nodos"))
    for item in ubicaciones:
        ubicacion = item if isinstance(item, Ubicacion) else Ubicacion(str(item.get("id")), str(item.get("nombre", "")))
        grafo.agregar_ubicacion(ubicacion)
    for item in _lista(datos, ("conexiones", "aristas", "rutas", "edges")):
        origen = item.get("origen", item.get("desde", item.get("from")))
        destino = item.get("destino", item.get("hasta", item.get("to")))
        distancia = item.get("distancia_km", item.get("distancia", item.get("peso")))
        tiempo = item.get("tiempo_base_min", item.get("tiempo"))
        costo = item.get("costo")
        if origen is None or destino is None or distancia is None or tiempo is None or costo is None:
            raise ErrorDatos("datos_invalidos")
        grafo.agregar_conexion(Conexion(str(origen), str(destino), float(distancia), float(tiempo), float(costo),
                                        bool(item.get("bidireccional", True))))
    return grafo


def cargar_solicitudes(ruta: str | Path) -> list[Solicitud]:
    solicitudes = []
    for i, x in enumerate(_lista(cargar_json(ruta), ("solicitudes", "pedidos"))):
        solicitudes.append(Solicitud(
            str(x.get("id", f"S{i + 1:05d}")),
            str(x.get("origen", x.get("desde", ""))),
            str(x.get("destino", x.get("hasta", ""))),
            str(x.get("prioridad", "media")),
            str(x.get("criterio", "tiempo")),
            str(x.get("trafico", "bajo")),
            int(x.get("pasajeros", 1)),
        ))
    return solicitudes


def cargar_vehiculos(ruta: str | Path) -> list[Vehiculo]:
    vehiculos = []
    for i, x in enumerate(_lista(cargar_json(ruta), ("vehiculos", "vehículos"))):
        vehiculos.append(Vehiculo(
            str(x.get("id", f"V{i + 1:02d}")),
            str(x.get("tipo", "urbano")),
            int(x.get("capacidad", 0)),
            str(x.get("conductor", "")),
            str(x.get("estado", "disponible")),
        ))
    return vehiculos


def guardar_json(ruta: str | Path, datos: Any) -> None:
    Path(ruta).write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")


# Nombres alternativos útiles para integrar la biblioteca con programas existentes.
leer_json = cargar_json
leer_red = cargar_grafo
leer_solicitudes = cargar_solicitudes
leer_vehiculos = cargar_vehiculos