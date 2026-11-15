import assert from "node:assert/strict";
import test from "node:test";
import { Grafo } from "../src/grafo";
import { Solicitud, Vehiculo } from "../src/modelos";
import { procesar } from "../src/procesador";
import { NodoInexistenteError, RutaInexistenteError, ValidacionError } from "../src/errores";

test("calcula la ruta mínima y el tiempo", () => {
  const grafo = new Grafo();
  grafo.agregar_conexion("A", "B", 4, 2);
  grafo.agregar_conexion("B", "C", 3, 5);
  const ruta = grafo.ruta_minima("A", "C");
  assert.deepEqual(ruta.nodos, ["A", "B", "C"]);
  assert.equal(ruta.distancia, 7);
  assert.equal(ruta.tiempo, 7);
});

test("asigna una solicitud y conserva pendientes", () => {
  const grafo = new Grafo();
  grafo.agregar_conexion("A", "B", 4);
  grafo.agregar_conexion("B", "C", 3);
  const resultado = procesar(grafo, [
    new Solicitud("1", "A", "C", 5),
    new Solicitud("2", "A", "C", 8),
  ], [new Vehiculo("V1", "A", 5)]);
  assert.equal(resultado.asignaciones.length, 1);
  assert.equal(resultado.no_asignadas.length, 1);
});

test("valida datos y rutas inexistentes", () => {
  assert.throws(() => new Vehiculo("", "A", 1), ValidacionError);
  const grafo = new Grafo();
  grafo.agregar_nodo("A");
  assert.throws(() => grafo.ruta_minima("A", "B"), NodoInexistenteError);
  grafo.agregar_nodo("B");
  assert.throws(() => grafo.ruta_minima("A", "B"), RutaInexistenteError);
});
