package iodatos

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"transporte/Internal/errores"
	"transporte/Internal/grafo"
	"transporte/Internal/modelos"
)

func CargarJSON(ruta string) (any, error) {
	bytes, err := os.ReadFile(ruta)
	if err != nil {
		return nil, &errores.ErrorDatos{Mensaje: err.Error()}
	}
	var valor any
	if err = json.Unmarshal(bytes, &valor); err != nil {
		return nil, &errores.ErrorDatos{Mensaje: err.Error()}
	}
	return valor, nil
}

func lista(valor any, claves ...string) ([]any, error) {
	if items, ok := valor.([]any); ok {
		return items, nil
	}
	if objeto, ok := valor.(map[string]any); ok {
		for _, clave := range claves {
			if items, ok := objeto[clave].([]any); ok {
				return items, nil
			}
		}
	}
	return nil, &errores.ErrorDatos{Mensaje: "Se esperaba una lista"}
}

func texto(objeto map[string]any, claves ...string) string {
	for _, clave := range claves {
		if valor, existe := objeto[clave]; existe {
			return fmt.Sprint(valor)
		}
	}
	return ""
}

func numero(objeto map[string]any, claves ...string) float64 {
	for _, clave := range claves {
		if valor, existe := objeto[clave].(float64); existe {
			return valor
		}
	}
	return 0
}

func CargarGrafo(ruta string) (*grafo.Grafo, error) {
	valor, err := CargarJSON(ruta)
	if err != nil {
		return nil, err
	}
	g := grafo.Nuevo()
	if objeto, ok := valor.(map[string]any); ok {
		if ubicaciones, ok := objeto["ubicaciones"].([]any); ok {
			for _, item := range ubicaciones {
				if ubicacion, ok := item.(map[string]any); ok {
					g.AgregarNodo(texto(ubicacion, "id"))
				}
			}
		}
		if nodos, ok := objeto["nodos"].([]any); ok {
			for _, item := range nodos {
				switch nodo := item.(type) {
				case string:
					g.AgregarNodo(nodo)
				case map[string]any:
					g.AgregarNodo(texto(nodo, "id"))
				}
			}
		}
	}
	items, err := lista(valor, "conexiones", "aristas", "rutas", "edges")
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		objeto, ok := item.(map[string]any)
		if !ok {
			return nil, &errores.ErrorDatos{Mensaje: "arista inválida"}
		}
		origen := texto(objeto, "origen", "desde", "from")
		destino := texto(objeto, "destino", "hasta", "to")
		distancia := numero(objeto, "distancia_km", "distancia", "peso", "weight")
		tiempo := numero(objeto, "tiempo_base_min", "tiempo")
		costo := numero(objeto, "costo")
		bidireccional := true
		if valor, ok := objeto["bidireccional"].(bool); ok {
			bidireccional = valor
		}
		g.AgregarArista(modelos.Arista{
			Origen: origen, Destino: destino, Distancia: distancia,
			Tiempo: tiempo, Costo: costo, Bidireccional: bidireccional,
		})
	}
	return g, nil
}

func CargarSolicitudes(ruta string) ([]modelos.Solicitud, error) {
	valor, err := CargarJSON(ruta)
	if err != nil {
		return nil, err
	}
	items, err := lista(valor, "solicitudes", "pedidos")
	if err != nil {
		return nil, err
	}
	resultado := []modelos.Solicitud{}
	for indice, item := range items {
		objeto, ok := item.(map[string]any)
		if !ok {
			return nil, &errores.ErrorDatos{Mensaje: "solicitud inválida"}
		}
		id := texto(objeto, "id")
		if id == "" {
			id = strconv.Itoa(indice)
		}
		pasajeros := numero(objeto, "pasajeros", "peso", "demanda")
		prioridad := 0
		if valor, ok := objeto["prioridad"].(float64); ok {
			prioridad = int(valor)
		} else {
			switch texto(objeto, "prioridad") {
			case "critica":
				prioridad = 4
			case "alta":
				prioridad = 3
			case "media":
				prioridad = 2
			case "baja":
				prioridad = 1
			}
		}
		resultado = append(resultado, modelos.Solicitud{
			ID: id, Origen: texto(objeto, "origen", "desde"),
			Destino: texto(objeto, "destino", "hasta"),
			Peso:    pasajeros, Prioridad: prioridad,
		})
	}
	return resultado, nil
}

func CargarVehiculos(ruta string) ([]modelos.Vehiculo, error) {
	valor, err := CargarJSON(ruta)
	if err != nil {
		return nil, err
	}
	items, err := lista(valor, "vehiculos", "vehículos")
	if err != nil {
		return nil, err
	}
	resultado := []modelos.Vehiculo{}
	for indice, item := range items {
		objeto, ok := item.(map[string]any)
		if !ok {
			return nil, &errores.ErrorDatos{Mensaje: "vehículo inválido"}
		}
		id := texto(objeto, "id")
		if id == "" {
			id = strconv.Itoa(indice)
		}
		disponible := true
		if estado, ok := objeto["estado"].(string); ok {
			disponible = estado == "disponible"
		} else if valor, ok := objeto["disponible"].(bool); ok {
			disponible = valor
		}
		origen := texto(objeto, "origen", "ubicacion")
		if origen == "" {
			origen = "A"
		}
		velocidad := numero(objeto, "velocidad")
		if velocidad == 0 {
			velocidad = 1
		}
		resultado = append(resultado, modelos.Vehiculo{
			ID: id, Origen: origen, Capacidad: numero(objeto, "capacidad"),
			Velocidad: velocidad, Disponible: disponible,
		})
	}
	return resultado, nil
}

func GuardarJSON(ruta string, valor any) error {
	bytes, err := json.MarshalIndent(valor, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(ruta, bytes, 0644)
}

var LeerJSON = CargarJSON
var LeerRed = CargarGrafo
var LeerSolicitudes = CargarSolicitudes
var LeerVehiculos = CargarVehiculos
