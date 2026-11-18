package modelos

type Nodo struct {
	ID     string `json:"id"`
	Nombre string `json:"nombre,omitempty"`
}
type Arista struct {
	Origen        string  `json:"origen"`
	Destino       string  `json:"destino"`
	Distancia     float64 `json:"distancia"`
	Tiempo        float64 `json:"tiempo,omitempty"`
	Costo         float64 `json:"costo,omitempty"`
	Bidireccional bool    `json:"bidireccional"`
}
type Solicitud struct {
	ID            string  `json:"id"`
	Origen        string  `json:"origen"`
	Destino       string  `json:"destino"`
	Peso          float64 `json:"peso"`
	Prioridad     int     `json:"prioridad"`
	VentanaInicio float64 `json:"ventana_inicio,omitempty"`
	VentanaFin    float64 `json:"ventana_fin,omitempty"`
}

func (s Solicitud) Demanda() float64 { return s.Peso }

type Vehiculo struct {
	ID         string  `json:"id"`
	Origen     string  `json:"origen"`
	Capacidad  float64 `json:"capacidad"`
	Velocidad  float64 `json:"velocidad"`
	Disponible bool    `json:"disponible"`
}
type Ruta struct {
	Nodos     []string `json:"nodos"`
	Distancia float64  `json:"distancia"`
	Tiempo    float64  `json:"tiempo"`
}

func (r Ruta) Costo() float64 { return r.Distancia }

type Asignacion struct {
	Solicitud Solicitud `json:"solicitud"`
	Vehiculo  Vehiculo  `json:"vehiculo"`
	Ruta      Ruta      `json:"ruta"`
}
type Resultado struct {
	Asignaciones   []Asignacion `json:"asignaciones"`
	NoAsignadas    []Solicitud  `json:"no_asignadas"`
	DistanciaTotal float64      `json:"distancia_total"`
	TiempoTotal    float64      `json:"tiempo_total"`
}
