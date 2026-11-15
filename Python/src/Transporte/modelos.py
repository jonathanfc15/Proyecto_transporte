from dataclasses import dataclass, field, asdict
from typing import Any
from .errores import (CAPACIDAD_MINIMA, DISTANCIA_MINIMA, VELOCIDAD_MINIMA,
                      ValidacionError)


@dataclass(frozen=True)
class Nodo:
    id: str
    nombre: str | None = None

    def __post_init__(self):
        if not str(self.id).strip():
            raise ValidacionError("El identificador del nodo es obligatorio")


@dataclass(frozen=True)
class Arista:
    origen: str
    destino: str
    distancia: float
    tiempo: float | None = None
    bidireccional: bool = True

    def __post_init__(self):
        if self.distancia < DISTANCIA_MINIMA:
            raise ValidacionError("La distancia no puede ser negativa")
        if self.tiempo is not None and self.tiempo < 0:
            raise ValidacionError("El tiempo no puede ser negativo")


@dataclass
class Solicitud:
    id: str
    origen: str
    destino: str
    peso: float = 0.0
    prioridad: int = 0
    ventana_inicio: float | None = None
    ventana_fin: float | None = None

    def __post_init__(self):
        if not self.id or not self.origen or not self.destino:
            raise ValidacionError("La solicitud requiere id, origen y destino")
        if self.peso < 0:
            raise ValidacionError("El peso de la solicitud no puede ser negativo")
        if self.ventana_inicio is not None and self.ventana_fin is not None:
            if self.ventana_fin < self.ventana_inicio:
                raise ValidacionError("La ventana de tiempo es inválida")

    @property
    def demanda(self) -> float:
        return self.peso


@dataclass
class Vehiculo:
    id: str
    origen: str
    capacidad: float
    velocidad: float = 1.0
    disponible: bool = True

    def __post_init__(self):
        if not self.id or not self.origen:
            raise ValidacionError("El vehículo requiere id y origen")
        if self.capacidad < CAPACIDAD_MINIMA:
            raise ValidacionError("La capacidad no puede ser negativa")
        if self.velocidad <= VELOCIDAD_MINIMA:
            raise ValidacionError("La velocidad debe ser positiva")

    @property
    def ubicacion(self) -> str:
        return self.origen


@dataclass
class Ruta:
    nodos: list[str]
    distancia: float
    tiempo: float

    @property
    def costo(self) -> float:
        return self.distancia

    @property
    def origen(self) -> str:
        return self.nodos[0]

    @property
    def destino(self) -> str:
        return self.nodos[-1]


@dataclass
class Asignacion:
    solicitud: Solicitud
    vehiculo: Vehiculo
    ruta: Ruta

    @property
    def costo(self) -> float:
        return self.ruta.costo


@dataclass
class Resultado:
    asignaciones: list[Asignacion] = field(default_factory=list)
    no_asignadas: list[Solicitud] = field(default_factory=list)
    distancia_total: float = 0.0
    tiempo_total: float = 0.0

    def a_dict(self) -> dict[str, Any]:
        return {
            "asignaciones": [asdict(a) for a in self.asignaciones],
            "no_asignadas": [asdict(s) for s in self.no_asignadas],
            "distancia_total": self.distancia_total,
            "tiempo_total": self.tiempo_total,
        }