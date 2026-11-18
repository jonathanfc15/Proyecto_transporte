import heapq
from collections import defaultdict


class Grafo:
    def __init__(self):
        self.ubicaciones = {}
        self.adyacencia = defaultdict(list)

    def agregar_ubicacion(self, ubicacion):
        self.ubicaciones[ubicacion.id] = ubicacion
        self.adyacencia.setdefault(ubicacion.id, [])

    def agregar_conexion(self, conexion):
        if conexion.origen not in self.ubicaciones or conexion.destino not in self.ubicaciones:
            raise ValueError("ubicacion_inexistente")
        if conexion.origen == conexion.destino:
            raise ValueError("datos_invalidos")
        if conexion.distancia_km <= 0 or conexion.tiempo_base_min <= 0 or conexion.costo <= 0:
            raise ValueError("datos_invalidos")
        for arista in self.adyacencia[conexion.origen]:
            if arista.destino == conexion.destino:
                raise ValueError("datos_invalidos")
        self.adyacencia[conexion.origen].append(conexion)
        if conexion.bidireccional:
            inversa = type(conexion)(
                conexion.destino, conexion.origen, conexion.distancia_km,
                conexion.tiempo_base_min, conexion.costo, True,
            )
            if all(a.destino != conexion.origen for a in self.adyacencia[conexion.destino]):
                self.adyacencia[conexion.destino].append(inversa)

    def vecinos(self, nodo):
        return list(self.adyacencia.get(nodo, []))
