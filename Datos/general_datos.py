import json
import random
from pathlib import Path


RAIZ = Path(__file__).resolve().parent
SEMILLA = 301


def guardar(nombre, datos):
    (RAIZ / nombre).write_text(
        json.dumps(datos, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def crear_red():
    ubicaciones = [
        {"id": "A", "nombre": "Terminal Norte"},
        {"id": "B", "nombre": "Centro Logístico"},
        {"id": "C", "nombre": "Terminal Sur"},
        {"id": "D", "nombre": "Almacén Industrial"},
        {"id": "E", "nombre": "Zona Metropolitana"},
        {"id": "F", "nombre": "Puerto Comercial"},
        {"id": "G", "nombre": "Aeropuerto"},
        {"id": "H", "nombre": "Parque Industrial"},
        {"id": "I", "nombre": "Ciudad Jardín"},
        {"id": "J", "nombre": "Terminal Oriente"},
    ]

    conexiones = [
        {"origen": "A", "destino": "B", "distancia_km": 12.5, "tiempo_base_min": 18, "costo": 8.5, "bidireccional": True},
        {"origen": "A", "destino": "D", "distancia_km": 21.0, "tiempo_base_min": 28, "costo": 13.0, "bidireccional": True},
        {"origen": "A", "destino": "G", "distancia_km": 18.0, "tiempo_base_min": 24, "costo": 12.0, "bidireccional": True},
        {"origen": "B", "destino": "C", "distancia_km": 15.2, "tiempo_base_min": 21, "costo": 9.8, "bidireccional": True},
        {"origen": "B", "destino": "E", "distancia_km": 9.5, "tiempo_base_min": 14, "costo": 7.2, "bidireccional": True},
        {"origen": "B", "destino": "H", "distancia_km": 23.0, "tiempo_base_min": 31, "costo": 14.5, "bidireccional": True},
        {"origen": "C", "destino": "F", "distancia_km": 19.8, "tiempo_base_min": 27, "costo": 13.5, "bidireccional": True},
        {"origen": "C", "destino": "I", "distancia_km": 11.3, "tiempo_base_min": 16, "costo": 8.1, "bidireccional": True},
        {"origen": "D", "destino": "E", "distancia_km": 17.4, "tiempo_base_min": 23, "costo": 11.0, "bidireccional": True},
        {"origen": "D", "destino": "H", "distancia_km": 14.7, "tiempo_base_min": 20, "costo": 10.2, "bidireccional": True},
        {"origen": "E", "destino": "G", "distancia_km": 10.8, "tiempo_base_min": 15, "costo": 7.8, "bidireccional": True},
        {"origen": "E", "destino": "I", "distancia_km": 13.6, "tiempo_base_min": 19, "costo": 9.4, "bidireccional": True},
        {"origen": "F", "destino": "I", "distancia_km": 16.1, "tiempo_base_min": 22, "costo": 10.8, "bidireccional": True},
        {"origen": "F", "destino": "J", "distancia_km": 22.5, "tiempo_base_min": 30, "costo": 15.0, "bidireccional": True},
        {"origen": "G", "destino": "J", "distancia_km": 20.3, "tiempo_base_min": 26, "costo": 13.8, "bidireccional": True},
        {"origen": "H", "destino": "J", "distancia_km": 18.8, "tiempo_base_min": 25, "costo": 12.4, "bidireccional": True},
        {"origen": "I", "destino": "J", "distancia_km": 12.9, "tiempo_base_min": 17, "costo": 8.9, "bidireccional": True},
    ]
    return {"ubicaciones": ubicaciones, "conexiones": conexiones}


def crear_vehiculos():
    vehiculos = [
        {"id": "V01", "tipo": "urbano", "capacidad": 4, "conductor": "Ana López", "estado": "disponible"},
        {"id": "V02", "tipo": "urbano", "capacidad": 6, "conductor": "Luis Pérez", "estado": "disponible"},
        {"id": "V03", "tipo": "refrigerado", "capacidad": 8, "conductor": "María Ruiz", "estado": "disponible"},
        {"id": "V04", "tipo": "volteo", "capacidad": 10, "conductor": "Carlos Díaz", "estado": "disponible"},
        {"id": "V05", "tipo": "contenedor", "capacidad": 12, "conductor": "Elena Soto", "estado": "disponible"},
        {"id": "V06", "tipo": "urbano", "capacidad": 5, "conductor": "José Mora", "estado": "ocupado"},
        {"id": "V07", "tipo": "refrigerado", "capacidad": 9, "conductor": "Paula Cruz", "estado": "disponible"},
        {"id": "V08", "tipo": "contenedor", "capacidad": 14, "conductor": "Raúl Vega", "estado": "disponible"},
    ]
    return {"vehiculos": vehiculos}


def crear_solicitudes(cantidad):
    azar = random.Random(SEMILLA)
    ids = [f"S{i:05d}" for i in range(1, cantidad + 1)]
    ubicaciones = list("ABCDEFGHIJ")
    prioridades = ["critica", "alta", "media", "baja"]
    criterios = ["distancia", "tiempo", "costo"]
    traficos = ["bajo", "medio", "alto"]
    solicitudes = []
    for id_solicitud in ids:
        origen, destino = azar.sample(ubicaciones, 2)
        solicitudes.append({
            "id": id_solicitud,
            "origen": origen,
            "destino": destino,
            "prioridad": azar.choice(prioridades),
            "criterio": azar.choice(criterios),
            "trafico": azar.choice(traficos),
            "pasajeros": azar.randint(1, 12),
        })
    return {"solicitudes": solicitudes}


def main():
    guardar("red.json", crear_red())
    guardar("vehiculo.json", crear_vehiculos())
    guardar("solicitudes_pequenas.json", crear_solicitudes(10))
    guardar("solicitudes_medianas.json", crear_solicitudes(1000))
    guardar("solicitudes_grandes.json", crear_solicitudes(10000))


if __name__ == "__main__":
    main()