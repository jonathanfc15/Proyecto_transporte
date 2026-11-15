from collections import defaultdict
import heapq
from .errores import NodoInexistenteError, RutaInexistenteError
from .modelos import Arista, Ruta


class Grafo:
    def __init__(self) -> None:
        self.adyacencia: dict[str, list[Arista]] = defaultdict(list)

    @property
    def nodos(self) -> set[str]:
        return set(self.adyacencia)

    def agregar_arista(self, arista: Arista, destino: str | None = None,
                       distancia: float | None = None) -> None:
        if not isinstance(arista, Arista):
            arista = Arista(str(arista), str(destino), float(distancia or 0))
        self.adyacencia[arista.origen].append(arista)
        self.adyacencia.setdefault(arista.destino, [])
        if arista.bidireccional:
            self.adyacencia[arista.destino].append(
                Arista(arista.destino, arista.origen, arista.distancia,
                       arista.tiempo, False))

    agregar_nodo = lambda self, nodo: self.adyacencia.setdefault(
        nodo.id if hasattr(nodo, "id") else str(nodo), [])

    def agregar_conexion(self, origen: str, destino: str, distancia: float,
                         tiempo: float | None = None,
                         bidireccional: bool = True) -> None:
        self.agregar_arista(Arista(origen, destino, distancia, tiempo,
                                    bidireccional))

    def ruta_minima(self, origen: str, destino: str) -> Ruta:
        if origen not in self.adyacencia or destino not in self.adyacencia:
            raise NodoInexistenteError(f"Nodo inexistente: {origen} o {destino}")
        cola = [(0.0, origen)]
        dist = {origen: 0.0}
        anterior: dict[str, tuple[str, Arista]] = {}
        while cola:
            costo, actual = heapq.heappop(cola)
            if costo != dist[actual]:
                continue
            if actual == destino:
                break
            for arista in self.adyacencia[actual]:
                nuevo = costo + arista.distancia
                if nuevo < dist.get(arista.destino, float("inf")):
                    dist[arista.destino] = nuevo
                    anterior[arista.destino] = (actual, arista)
                    heapq.heappush(cola, (nuevo, arista.destino))
        if destino not in dist:
            raise RutaInexistenteError(f"No existe ruta de {origen} a {destino}")
        nodos, tiempos = [destino], []
        actual = destino
        while actual != origen:
            previo, arista = anterior[actual]
            nodos.append(previo)
            tiempos.append(arista.tiempo if arista.tiempo is not None
                           else arista.distancia)
            actual = previo
        nodos.reverse()
        return Ruta(nodos, dist[destino], sum(tiempos))

    camino_minimo = ruta_minima

    def vecinos(self, nodo: str) -> list[Arista]:
        if nodo not in self.adyacencia:
            raise NodoInexistenteError(f"Nodo inexistente: {nodo}")
        return list(self.adyacencia[nodo])

    def dijkstra(self, origen: str, destino: str) -> Ruta:
        return self.ruta_minima(origen, destino)