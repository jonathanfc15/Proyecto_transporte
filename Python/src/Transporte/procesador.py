from concurrent.futures import ThreadPoolExecutor
from .modelos import ResultadoSolicitud
from .rutas import dijkstra


PLAZOS = {"critica": 60, "alta": 120, "media": 480, "baja": 1440}
ORDEN_PRIORIDAD = {"critica": 0, "alta": 1, "media": 2, "baja": 3}
ERRORES_VALIDACION = {"datos_invalidos", "ubicacion_inexistente", "origen_igual_destino", "ruta_no_encontrada"}


def validar_solicitud(grafo, solicitud):
    if not solicitud.id or not solicitud.origen or not solicitud.destino:
        return "datos_invalidos"
    if solicitud.prioridad not in PLAZOS or solicitud.criterio not in {"distancia", "tiempo", "costo"}:
        return "datos_invalidos"
    if solicitud.trafico not in {"bajo", "medio", "alto"} or solicitud.pasajeros <= 0:
        return "datos_invalidos"
    if solicitud.origen == solicitud.destino:
        return "origen_igual_destino"
    if solicitud.origen not in grafo.ubicaciones or solicitud.destino not in grafo.ubicaciones:
        return "ubicacion_inexistente"
    return None


def procesar_solicitud(grafo, solicitud):
    error = validar_solicitud(grafo, solicitud)
    if error:
        return ResultadoSolicitud(solicitud.id, "rechazada", error=error)
    ruta = dijkstra(grafo, solicitud.origen, solicitud.destino, solicitud.criterio, solicitud.trafico)
    if ruta is None:
        return ResultadoSolicitud(solicitud.id, "rechazada", error="ruta_no_encontrada")
    return ResultadoSolicitud(
        solicitud.id, "pendiente", solicitud.prioridad, solicitud.origen, solicitud.destino,
        solicitud.criterio, solicitud.trafico, ruta=ruta["ruta"],
        distancia_km=ruta["distancia_km"], tiempo_min=ruta["tiempo_min"],
        costo=ruta["costo"], dentro_de_plazo=ruta["tiempo_min"] <= PLAZOS[solicitud.prioridad],
    )


def procesar(grafo, solicitudes, vehiculos, modo="secuencial"):
    vehiculos = list(vehiculos)
    if modo == "concurrente":
        with ThreadPoolExecutor() as ejecutor:
            calculadas = list(ejecutor.map(lambda s: procesar_solicitud(grafo, s), solicitudes))
    else:
        calculadas = [procesar_solicitud(grafo, solicitud) for solicitud in solicitudes]

    rechazadas = [r for r in calculadas if r.estado == "rechazada"]
    candidatas = [r for r in calculadas if r.estado != "rechazada"]

    en_espera = []
    asignadas = []
    for resultado in sorted(candidatas, key=lambda r: (ORDEN_PRIORIDAD[r.prioridad], r.id)):
        solicitud = next(s for s in solicitudes if s.id == resultado.id)
        disponibles = [
            v for v in vehiculos
            if v.estado == "disponible" and v.capacidad >= solicitud.pasajeros
        ]
        if disponibles:
            vehiculo = min(disponibles, key=lambda v: v.id)
            vehiculo.estado = "ocupado"
            resultado.estado = "asignada"
            resultado.vehiculo = vehiculo.id
            asignadas.append(resultado)
        else:
            resultado.estado = "en_cola"
            en_espera.append(resultado)

    todas = asignadas + en_espera + rechazadas
    todas.sort(key=lambda r: r.id)
    asignadas_finales = [r for r in todas if r.estado == "asignada"]
    ocupados = sum(v.estado == "ocupado" for v in vehiculos)
    disponibles = len(vehiculos) - ocupados
    total = len(todas)
    promedio = lambda campo: round(sum(getattr(r, campo) for r in asignadas_finales) / len(asignadas_finales), 2) if asignadas_finales else 0.0
    resumen = {
        "total": total,
        "asignadas": len(asignadas_finales),
        "en_cola": sum(r.estado == "en_cola" for r in todas),
        "rechazadas": len(rechazadas),
        "fuera_de_plazo": sum(r.estado == "asignada" and not r.dentro_de_plazo for r in todas),
        "distancia_promedio_km": promedio("distancia_km"),
        "tiempo_promedio_min": promedio("tiempo_min"),
        "costo_promedio": promedio("costo"),
        "vehiculos_ocupados": ocupados,
        "vehiculos_disponibles": disponibles,
        "uso_vehiculos_pct": round(ocupados / len(vehiculos) * 100, 2) if vehiculos else 0.0,
    }
    return {"resumen": resumen, "solicitudes": [r.a_dict() for r in todas]}
