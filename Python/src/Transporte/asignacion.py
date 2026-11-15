from .errores import CapacidadInsuficienteError, RutaInexistenteError
from .grafo import Grafo
from .modelos import Asignacion, Solicitud, Vehiculo


def asignar_solicitudes(grafo: Grafo, solicitudes: list[Solicitud],
                        vehiculos: list[Vehiculo]) -> tuple[list[Asignacion], list[Solicitud]]:
    asignaciones, pendientes = [], []
    libres = {v.id: v for v in vehiculos if v.disponible}
    for solicitud in sorted(solicitudes, key=lambda x: (-x.prioridad, x.id)):
        candidatos = [v for v in libres.values() if v.capacidad >= solicitud.peso]
        mejor = None
        for vehiculo in candidatos:
            try:
                recogida = grafo.ruta_minima(vehiculo.origen, solicitud.origen)
                entrega = grafo.ruta_minima(solicitud.origen, solicitud.destino)
            except RutaInexistenteError:
                continue
            total = recogida.distancia + entrega.distancia
            if mejor is None or total < mejor[0]:
                mejor = total, vehiculo, entrega
        if mejor is None:
            pendientes.append(solicitud)
        else:
            _, vehiculo, entrega = mejor
            asignaciones.append(Asignacion(solicitud, vehiculo, entrega))
            libres.pop(vehiculo.id)
    return asignaciones, pendientes


def asignar_solicitud(grafo: Grafo, solicitud: Solicitud,
                      vehiculos: list[Vehiculo]) -> Asignacion:
    asignadas, pendientes = asignar_solicitudes(grafo, [solicitud], vehiculos)
    if pendientes:
        raise CapacidadInsuficienteError(f"No se pudo asignar {solicitud.id}")
    return asignadas[0]