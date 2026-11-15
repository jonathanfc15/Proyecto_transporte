from .asignacion import asignar_solicitudes
from .grafo import Grafo
from .modelos import Resultado, Solicitud, Vehiculo


def procesar(grafo: Grafo, solicitudes: list[Solicitud],
             vehiculos: list[Vehiculo]) -> Resultado:
    asignaciones, pendientes = asignar_solicitudes(grafo, solicitudes, vehiculos)
    return Resultado(asignaciones, pendientes,
                     sum(a.ruta.distancia for a in asignaciones),
                     sum(a.ruta.tiempo for a in asignaciones))


class Procesador:
    def __init__(self, grafo: Grafo) -> None:
        self.grafo = grafo

    def procesar(self, solicitudes: list[Solicitud],
                 vehiculos: list[Vehiculo]) -> Resultado:
        return procesar(self.grafo, solicitudes, vehiculos)