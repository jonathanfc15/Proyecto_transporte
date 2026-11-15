"""Benchmark pequeño y reproducible de la fase 1."""
import json
import time
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / "src"))
from Transporte.grafo import Grafo


def ejecutar(repeticiones: int = 1000) -> dict:
    grafo = Grafo()
    for i in range(100):
        grafo.agregar_conexion(str(i), str(i + 1), 1)
    inicio = time.perf_counter()
    for _ in range(repeticiones):
        grafo.ruta_minima("0", "100")
    transcurrido = time.perf_counter() - inicio
    return {"repeticiones": repeticiones, "segundos": transcurrido}


if __name__ == "__main__":
    print(json.dumps(ejecutar(), ensure_ascii=False, indent=2))