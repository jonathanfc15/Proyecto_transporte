package rutas
import ("transporte/Internal/grafo";"transporte/Internal/modelos")
func CalcularRuta(g *grafo.Grafo,o,d string)(modelos.Ruta,error){return g.RutaMinima(o,d)}
func CalcularRutas(g *grafo.Grafo,p [][2]string)([]modelos.Ruta,error){r:=make([]modelos.Ruta,0,len(p));for _,x:=range p{y,e:=CalcularRuta(g,x[0],x[1]);if e!=nil{return nil,e};r=append(r,y)};return r,nil}
func RutaMasCorta(g *grafo.Grafo,o,d string)(modelos.Ruta,error){return CalcularRuta(g,o,d)}