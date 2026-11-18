package procesador

import (
	"transporte/Internal/asignacion"
	"transporte/Internal/grafo"
	"transporte/Internal/modelos"
)

func Procesar(g *grafo.Grafo, s []modelos.Solicitud, v []modelos.Vehiculo) modelos.Resultado {
	a, p := asignacion.AsignarSolicitudes(g, s, v)
	r := modelos.Resultado{Asignaciones: a, NoAsignadas: p}
	for _, x := range a {
		r.DistanciaTotal += x.Ruta.Distancia
		r.TiempoTotal += x.Ruta.Tiempo
	}
	return r
}

type Procesador struct{ Grafo *grafo.Grafo }

func Nuevo(g *grafo.Grafo) *Procesador         { return &Procesador{Grafo: g} }
func NewProcesador(g *grafo.Grafo) *Procesador { return Nuevo(g) }
func (p *Procesador) Procesar(s []modelos.Solicitud, v []modelos.Vehiculo) modelos.Resultado {
	return Procesar(p.Grafo, s, v)
}
