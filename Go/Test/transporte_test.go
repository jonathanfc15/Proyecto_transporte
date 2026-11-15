package Test

import (
	"testing"
	"transporte/Internal/grafo"
	"transporte/Internal/modelos"
	"transporte/Internal/procesador"
)

func TestRutaYAsignacion(t *testing.T) {
	g := grafo.Nuevo()
	g.AgregarConexion("A", "B", 4)
	g.AgregarConexion("B", "C", 3)
	r, err := g.RutaMinima("A", "C")
	if err != nil || r.Distancia != 7 { t.Fatalf("ruta incorrecta: %#v %v", r, err) }
	res := procesador.Procesar(g, []modelos.Solicitud{{ID:"1", Origen:"A", Destino:"C", Peso:5}}, []modelos.Vehiculo{{ID:"V1", Origen:"A", Capacidad:5, Disponible:true}})
	if len(res.Asignaciones) != 1 { t.Fatalf("asignación incorrecta: %#v", res) }
}