package errores

import "errors"

var (
	ErrDatos                 = errors.New("datos inválidos")
	ErrNodoInexistente       = errors.New("nodo inexistente")
	ErrRutaInexistente       = errors.New("ruta inexistente")
	ErrCapacidadInsuficiente = errors.New("capacidad insuficiente")
)

type ErrorDatos struct{ Mensaje string }

func (e *ErrorDatos) Error() string { return e.Mensaje }

type NodoInexistenteError struct{ Mensaje string }

func (e *NodoInexistenteError) Error() string { return e.Mensaje }

type RutaInexistenteError struct{ Mensaje string }

func (e *RutaInexistenteError) Error() string { return e.Mensaje }

type CapacidadInsuficienteError struct{ Mensaje string }

func (e *CapacidadInsuficienteError) Error() string { return e.Mensaje }
