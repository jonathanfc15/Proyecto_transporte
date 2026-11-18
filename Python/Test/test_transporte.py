import unittest
from Transporte.grafo import Grafo
from Transporte.io_datos import cargar_grafo
from Transporte.modelos import Solicitud, Vehiculo
from Transporte.procesador import procesar
from Transporte.rutas import dijkstra, todas_las_rutas


class PruebasTransporte(unittest.TestCase):
    def setUp(self):
        self.grafo = cargar_grafo("Datos/red.json")

    def test_ruta_minima(self):
        ruta = dijkstra(self.grafo, "A", "C", "distancia", "bajo")
        self.assertIsNotNone(ruta)
        self.assertEqual(ruta["ruta"][0], "A")
        self.assertEqual(ruta["ruta"][-1], "C")

    def test_todas_las_rutas(self):
        rutas = todas_las_rutas(self.grafo, "A", "C", "distancia", "bajo")
        self.assertGreater(len(rutas), 1)
        self.assertEqual(rutas, sorted(rutas, key=lambda r: (r["distancia_km"], len(r["ruta"]) - 1, tuple(r["ruta"]))))

    def test_asignacion(self):
        solicitudes = [Solicitud("S1", "A", "C", "critica", "distancia", "bajo", 2)]
        resultado = procesar(self.grafo, solicitudes, [Vehiculo("V1", "urbano", 4, "Ana", "disponible")])
        self.assertEqual(resultado["resumen"]["asignadas"], 1)

    def test_solicitud_invalida(self):
        resultado = procesar(self.grafo, [Solicitud("S2", "A", "A", "baja", "tiempo", "bajo", 1)],
                             [Vehiculo("V1", "urbano", 4, "Ana", "disponible")])
        self.assertEqual(resultado["solicitudes"][0]["estado"], "rechazada")
        self.assertEqual(resultado["solicitudes"][0]["error"], "origen_igual_destino")


if __name__ == "__main__":
    unittest.main()