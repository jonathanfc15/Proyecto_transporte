import argparse
import json
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from Transporte.io_datos import cargar_grafo, cargar_solicitudes, cargar_vehiculos
    from Transporte.procesador import procesar
else:
    from .io_datos import cargar_grafo, cargar_solicitudes, cargar_vehiculos
    from .procesador import procesar


def main() -> None:
    parser = argparse.ArgumentParser(description="Procesador de transporte")
    parser.add_argument("--red", required=True)
    parser.add_argument("--solicitudes", required=True)
    parser.add_argument("--vehiculos", required=True)
    parser.add_argument("--modo", choices=("secuencial", "concurrente"), default="secuencial")
    args = parser.parse_args()
    resultado = procesar(
        cargar_grafo(args.red),
        cargar_solicitudes(args.solicitudes),
        cargar_vehiculos(args.vehiculos),
        args.modo,
    )
    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
