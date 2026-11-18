from .procesador import procesar


def asignar_solicitudes(grafo, solicitudes, vehiculos):
    resultado = procesar(grafo, solicitudes, vehiculos)
    asignadas = [item for item in resultado["solicitudes"] if item["estado"] == "asignada"]
    pendientes = [item for item in resultado["solicitudes"] if item["estado"] == "en_cola"]
    return asignadas, pendientes