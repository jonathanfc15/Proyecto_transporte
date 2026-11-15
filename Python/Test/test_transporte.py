import unittest

from Transporte.grafo import Grafo
from Transporte.modelos import Solicitud, Vehiculo
from Transporte.procesador import procesar


class PruebasTransporte(unittest.TestCase):
    def setUp(self):
        self.grafo = Grafo()
        self.grafo.agregar_conexion("A", "B", 4)
        self.grafo.agregar_conexion("B", "C", 3)

    def test_ruta_minima(self):
        ruta = self.grafo.ruta_minima("A", "C")
        self.assertEqual(ruta.nodos, ["A", "B", "C"])
        self.assertEqual(ruta.distancia, 7)

    def test_asignacion_y_pendiente(self):
        solicitudes = [Solicitud("1", "A", "C", 5),
                       Solicitud("2", "A", "C", 8)]
        resultado = procesar(self.grafo, solicitudes, [Vehiculo("V1", "A", 5)])
        self.assertEqual(len(resultado.asignaciones), 1)
        self.assertEqual(len(resultado.no_asignadas), 1)


if __name__ == "__main__":
    unittest.main()