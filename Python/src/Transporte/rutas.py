from .grafo import Grafo
from .modelos import Ruta


def calcular_ruta(grafo: Grafo, origen: str, destino: str) -> Ruta:
    return grafo.ruta_minima(origen, destino)


def calcular_rutas(grafo: Grafo, pares: list[tuple[str, str]]) -> list[Ruta]:
    return [calcular_ruta(grafo, o, d) for o, d in pares]


ruta_mas_corta = calcular_ruta