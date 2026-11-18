import json
import sys
from pathlib import Path


TOLERANCIA = 0.01
CAMPOS_MEDICION = {"lenguaje", "tamano", "modo", "tiempo_ms"}


def normalizar(valor):
    if isinstance(valor, dict):
        return {clave: normalizar(contenido) for clave, contenido in valor.items() if clave not in CAMPOS_MEDICION}
    if isinstance(valor, list):
        return [normalizar(elemento) for elemento in valor]
    if isinstance(valor, float):
        return round(valor, 2)
    return valor


def cargar(ruta):
    with open(ruta, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


def comparar(referencia, resultado):
    return normalizar(referencia) == normalizar(resultado)


def main():
    if len(sys.argv) != 3:
        print("Uso: python comparar_resultados.py <resultado.json> <esperado.json>")
        return 2

    referencia = cargar(sys.argv[2])
    resultado = cargar(sys.argv[1])
    if comparar(referencia, resultado):
        print("RESULTADO: coincidente")
        return 0
    print("RESULTADO: diferencias encontradas")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())