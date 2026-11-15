import json
from pathlib import Path
from typing import Any
from .errores import ErrorDatos
from .grafo import Grafo
from .modelos import Arista, Solicitud, Vehiculo


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
    if isinstance(datos, dict) and "nodos" in datos:
        for nodo in datos["nodos"]:
            grafo.agregar_nodo(nodo if isinstance(nodo, str) else nodo.get("id"))
    for item in _lista(datos, ("aristas", "conexiones", "rutas", "edges")):
        origen = item.get("origen", item.get("desde", item.get("from")))
        destino = item.get("destino", item.get("hasta", item.get("to")))
        distancia = item.get("distancia", item.get("peso", item.get("weight")))
        if origen is None or destino is None or distancia is None:
            raise ErrorDatos("Arista incompleta")
        bidireccional = item.get("bidireccional")
        if bidireccional is None:
            bidireccional = not bool(item.get("dirigida", False))
        grafo.agregar_arista(Arista(str(origen), str(destino), float(distancia),
                                    float(item["tiempo"]) if item.get("tiempo") is not None else None,
                                    bool(bidireccional)))
    return grafo


def cargar_solicitudes(ruta: str | Path) -> list[Solicitud]:
    return [Solicitud(str(x.get("id", i)), str(x.get("origen", x.get("desde"))),
                      str(x.get("destino", x.get("hasta"))),
                      float(x.get("peso", x.get("demanda", 0))),
                      int(x.get("prioridad", 0)), x.get("ventana_inicio"),
                      x.get("ventana_fin"))
            for i, x in enumerate(_lista(cargar_json(ruta), ("solicitudes", "pedidos")))]


def cargar_vehiculos(ruta: str | Path) -> list[Vehiculo]:
    return [Vehiculo(str(x.get("id", i)), str(x.get("origen", x.get("ubicacion", ""))),
                     float(x.get("capacidad", 0)), float(x.get("velocidad", 1)),
                     bool(x.get("disponible", True)))
            for i, x in enumerate(_lista(cargar_json(ruta), ("vehiculos", "vehículos")))]


def guardar_json(ruta: str | Path, datos: Any) -> None:
    Path(ruta).write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")


# Nombres alternativos útiles para integrar la biblioteca con programas existentes.
leer_json = cargar_json
leer_red = cargar_grafo
leer_solicitudes = cargar_solicitudes
leer_vehiculos = cargar_vehiculos