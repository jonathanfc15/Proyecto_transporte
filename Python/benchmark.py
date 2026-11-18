"""Benchmark reproducible de procesamiento completo."""
import json
import time
from pathlib import Path
import sys

raiz = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).parent / "src"))
from Transporte.io_datos import cargar_grafo, cargar_solicitudes, cargar_vehiculos
from Transporte.procesador import procesar


def ejecutar(ruta_solicitudes):
    inicio = time.perf_counter()
    resultado = procesar(
        cargar_grafo(raiz / "Datos" / "red.json"),
        cargar_solicitudes(ruta_solicitudes),
        cargar_vehiculos(raiz / "Datos" / "vehiculo.json"),
        "secuencial",
    )
    segundos = time.perf_counter() - inicio
    return {
        "lenguaje": "Python",
        "solicitudes": resultado["resumen"]["total"],
        "modo": "secuencial",
        "tiempo_ms": round(segundos * 1000, 3),
    }


if __name__ == "__main__":
    resultados = []
    for nombre, tamano in (
        ("pequenas", "pequenas"),
        ("medianas", "medianas"),
        ("grandes", "grandes"),
    ):
        ruta = raiz / "Datos" / f"solicitudes_{nombre}.json"
        resultado = ejecutar(ruta)
        resultado["tamano"] = tamano
        resultados.append(resultado)
    print(json.dumps(resultados, ensure_ascii=False, indent=2))