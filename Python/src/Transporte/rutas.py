import heapq


FACTORES_TRAFICO = {"bajo": 1.0, "medio": 1.5, "alto": 2.0}
LIMITE_CONEXIONES = 6


def peso_arista(arista, criterio, trafico):
    if criterio == "distancia":
        return arista.distancia_km
    if criterio == "costo":
        return arista.costo
    if trafico not in FACTORES_TRAFICO:
        raise ValueError("datos_invalidos")
    return arista.tiempo_base_min * FACTORES_TRAFICO[trafico]


def dijkstra(grafo, origen, destino, criterio="tiempo", trafico="bajo"):
    if origen not in grafo.ubicaciones or destino not in grafo.ubicaciones:
        return None
    if origen == destino:
        return None
    distancia = {origen: 0.0}
    conexiones = {origen: 0}
    camino = {origen: (origen,)}
    cola = [(0.0, 0, (origen,), origen)]

    while cola:
        valor, cantidad, secuencia, actual = heapq.heappop(cola)
        if valor != distancia.get(actual) or cantidad != conexiones.get(actual):
            continue
        if actual == destino:
            return reconstruir_resultado(grafo, secuencia, criterio, trafico)
        if cantidad >= LIMITE_CONEXIONES:
            continue
        for arista in grafo.vecinos(actual):
            siguiente = arista.destino
            if siguiente in secuencia:
                continue
            nuevo_valor = valor + peso_arista(arista, criterio, trafico)
            nueva_cantidad = cantidad + 1
            nueva_secuencia = secuencia + (siguiente,)
            clave_actual = distancia.get(siguiente)
            clave_conexiones = conexiones.get(siguiente)
            if (clave_actual is None or nuevo_valor < clave_actual or
                (nuevo_valor == clave_actual and nueva_cantidad < clave_conexiones) or
                (nuevo_valor == clave_actual and nueva_cantidad == clave_conexiones and nueva_secuencia < camino.get(siguiente))):
                distancia[siguiente] = nuevo_valor
                conexiones[siguiente] = nueva_cantidad
                camino[siguiente] = nueva_secuencia
                heapq.heappush(cola, (nuevo_valor, nueva_cantidad, nueva_secuencia, siguiente))
    return None


def reconstruir_resultado(grafo, secuencia, criterio, trafico):
    nodos = list(secuencia)
    distancia_km = 0.0
    tiempo_min = 0.0
    costo = 0.0
    for origen, destino in zip(nodos, nodos[1:]):
        arista = next(a for a in grafo.vecinos(origen) if a.destino == destino)
        distancia_km += arista.distancia_km
        tiempo_min += arista.tiempo_base_min * FACTORES_TRAFICO[trafico]
        costo += arista.costo
    return {
        "ruta": nodos,
        "distancia_km": round(distancia_km, 2),
        "tiempo_min": round(tiempo_min, 2),
        "costo": round(costo, 2),
    }


def todas_las_rutas(grafo, origen, destino, criterio="tiempo", trafico="bajo"):
    if origen not in grafo.ubicaciones or destino not in grafo.ubicaciones:
        return []
    rutas = []

    def buscar(actual, secuencia):
        if len(secuencia) - 1 > LIMITE_CONEXIONES:
            return
        if actual == destino:
            resultado = reconstruir_resultado(grafo, tuple(secuencia), criterio, trafico)
            rutas.append(resultado)
            return
        for arista in grafo.vecinos(actual):
            if arista.destino not in secuencia:
                buscar(arista.destino, secuencia + [arista.destino])

    buscar(origen, [origen])

    def clave(ruta):
        if criterio == "distancia":
            valor = ruta["distancia_km"]
        elif criterio == "costo":
            valor = ruta["costo"]
        else:
            valor = ruta["tiempo_min"]
        return (valor, len(ruta["ruta"]) - 1, tuple(ruta["ruta"]))

    return sorted(rutas, key=clave)
