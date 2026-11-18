package grafo

import (
	"container/heap"
	"fmt"
	"sort"
	"transporte/Internal/errores"
	"transporte/Internal/modelos"
)

type Grafo struct{ Adyacencia map[string][]modelos.Arista }

func Nuevo() *Grafo    { return &Grafo{Adyacencia: map[string][]modelos.Arista{}} }
func NewGrafo() *Grafo { return Nuevo() }
func (g *Grafo) init() {
	if g.Adyacencia == nil {
		g.Adyacencia = map[string][]modelos.Arista{}
	}
}
func (g *Grafo) AgregarNodo(id string) {
	g.init()
	if _, ok := g.Adyacencia[id]; !ok {
		g.Adyacencia[id] = nil
	}
}
func (g *Grafo) Nodos() []string {
	g.init()
	r := make([]string, 0, len(g.Adyacencia))
	for n := range g.Adyacencia {
		r = append(r, n)
	}
	sort.Strings(r)
	return r
}
func (g *Grafo) AgregarArista(a modelos.Arista) {
	g.init()
	g.Adyacencia[a.Origen] = append(g.Adyacencia[a.Origen], a)
	if _, ok := g.Adyacencia[a.Destino]; !ok {
		g.Adyacencia[a.Destino] = nil
	}
	if a.Bidireccional {
		a.Origen, a.Destino = a.Destino, a.Origen
		a.Bidireccional = false
		g.Adyacencia[a.Origen] = append(g.Adyacencia[a.Origen], a)
	}
}
func (g *Grafo) AgregarConexion(o, d string, dist float64, opciones ...any) {
	t := 0.0
	b := true
	for _, x := range opciones {
		switch v := x.(type) {
		case float64:
			t = v
		case int:
			t = float64(v)
		case bool:
			b = v
		}
	}
	g.AgregarArista(modelos.Arista{Origen: o, Destino: d, Distancia: dist, Tiempo: t, Bidireccional: b})
}

type item struct {
	nodo      string
	distancia float64
}
type cola []*item

func (q cola) Len() int           { return len(q) }
func (q cola) Less(i, j int) bool { return q[i].distancia < q[j].distancia }
func (q cola) Swap(i, j int)      { q[i], q[j] = q[j], q[i] }
func (q *cola) Push(x any)        { *q = append(*q, x.(*item)) }
func (q *cola) Pop() any          { a := *q; n := len(a); x := a[n-1]; *q = a[:n-1]; return x }
func (g *Grafo) RutaMinima(origen, destino string) (modelos.Ruta, error) {
	g.init()
	if _, ok := g.Adyacencia[origen]; !ok {
		return modelos.Ruta{}, &errores.NodoInexistenteError{Mensaje: fmt.Sprintf("Nodo inexistente: %s", origen)}
	}
	if _, ok := g.Adyacencia[destino]; !ok {
		return modelos.Ruta{}, &errores.NodoInexistenteError{Mensaje: fmt.Sprintf("Nodo inexistente: %s", destino)}
	}
	dist := map[string]float64{origen: 0}
	prev := map[string]struct {
		n string
		a modelos.Arista
	}{}
	q := &cola{&item{origen, 0}}
	heap.Init(q)
	for q.Len() > 0 {
		x := heap.Pop(q).(*item)
		if x.distancia != dist[x.nodo] {
			continue
		}
		for _, a := range g.Adyacencia[x.nodo] {
			if a.Distancia < 0 {
				return modelos.Ruta{}, &errores.RutaInexistenteError{Mensaje: "distancia negativa"}
			}
			nd := x.distancia + a.Distancia
			if old, ok := dist[a.Destino]; !ok || nd < old {
				dist[a.Destino] = nd
				prev[a.Destino] = struct {
					n string
					a modelos.Arista
				}{x.nodo, a}
				heap.Push(q, &item{a.Destino, nd})
			}
		}
	}
	cost, ok := dist[destino]
	if !ok {
		return modelos.Ruta{}, &errores.RutaInexistenteError{Mensaje: fmt.Sprintf("No existe ruta de %s a %s", origen, destino)}
	}
	nodes := []string{destino}
	tm := 0.0
	cur := destino
	for cur != origen {
		x := prev[cur]
		nodes = append(nodes, x.n)
		if x.a.Tiempo != 0 {
			tm += x.a.Tiempo
		} else {
			tm += x.a.Distancia
		}
		cur = x.n
	}
	for i, j := 0, len(nodes)-1; i < j; i, j = i+1, j-1 {
		nodes[i], nodes[j] = nodes[j], nodes[i]
	}
	return modelos.Ruta{Nodos: nodes, Distancia: cost, Tiempo: tm}, nil
}
func (g *Grafo) CaminoMinimo(o, d string) (modelos.Ruta, error) { return g.RutaMinima(o, d) }
func (g *Grafo) Dijkstra(o, d string) (modelos.Ruta, error)     { return g.RutaMinima(o, d) }
func (g *Grafo) Vecinos(n string) ([]modelos.Arista, error) {
	g.init()
	a, ok := g.Adyacencia[n]
	if !ok {
		return nil, &errores.NodoInexistenteError{Mensaje: "Nodo inexistente"}
	}
	return append([]modelos.Arista(nil), a...), nil
}
