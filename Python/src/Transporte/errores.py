"""Excepciones y constantes de validación del dominio."""
DISTANCIA_MINIMA = 0.0
CAPACIDAD_MINIMA = 0.0
VELOCIDAD_MINIMA = 0.0

class ErrorTransporte(Exception):
    """Error base del sistema de transporte."""


class ErrorDatos(ErrorTransporte):
    """Los datos de entrada no tienen el formato esperado."""


class NodoInexistenteError(ErrorTransporte):
    """Se solicitó un nodo que no pertenece a la red."""


class RutaInexistenteError(ErrorTransporte):
    """No existe una ruta entre dos nodos."""


class CapacidadInsuficienteError(ErrorTransporte):
    """El vehículo no tiene capacidad suficiente."""


class ValidacionError(ErrorDatos):
    """Un modelo contiene un valor inválido."""


class SolicitudInexistenteError(ErrorTransporte):
    """La solicitud indicada no existe."""