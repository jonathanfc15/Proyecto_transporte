from dataclasses import dataclass, asdict
from typing import Optional


@dataclass(frozen=True)
class Ubicacion:
    id: str
    nombre: str


@dataclass(frozen=True)
class Conexion:
    origen: str
    destino: str
    distancia_km: float
    tiempo_base_min: float
    costo: float
    bidireccional: bool = True


@dataclass
class Vehiculo:
    id: str
    tipo: str
    capacidad: int
    conductor: str
    estado: str = "disponible"


@dataclass
class Solicitud:
    id: str
    origen: str
    destino: str
    prioridad: str = "media"
    criterio: str = "tiempo"
    trafico: str = "bajo"
    pasajeros: int = 1


@dataclass
class ResultadoSolicitud:
    id: str
    estado: str
    prioridad: Optional[str] = None
    origen: Optional[str] = None
    destino: Optional[str] = None
    criterio: Optional[str] = None
    trafico: Optional[str] = None
    vehiculo: Optional[str] = None
    ruta: Optional[list[str]] = None
    distancia_km: Optional[float] = None
    tiempo_min: Optional[float] = None
    costo: Optional[float] = None
    dentro_de_plazo: Optional[bool] = None
    error: Optional[str] = None

    def a_dict(self):
        return asdict(self)
