```text
Proyecto Transporte
===================

Proyecto universitario que implementa y compara un sistema de transporte mediante
Python, Go y TypeScript. Todas las implementaciones utilizan los mismos datos,
las mismas reglas de negocio y el formato de salida definido en Datos/.

CONTENIDO
---------

- Objetivo
- Requisitos
- Estructura
- Datos compartidos
- Reglas de negocio
- Generación de datos
- Python
- Go
- TypeScript
- Visualización web
- Pruebas
- Benchmarks
- Comparación de resultados
- Errores
- Estado actual

OBJETIVO
--------

El sistema permite administrar ubicaciones, conexiones, vehículos y solicitudes
de transporte. Además calcula rutas por distancia, tiempo y costo, asigna
vehículos disponibles y muestra la red mediante una interfaz web local.

Las implementaciones deben producir resultados equivalentes pese a utilizar
paradigmas, tipos y sistemas de ejecución diferentes.

REQUISITOS
----------

- Windows con PowerShell.
- Python 3.11 o superior.
- Node.js 20 o superior.
- Go 1.21 o superior.
- Navegador moderno.
- Conexión a Internet para las calles y los mapas públicos de OpenStreetMap/OSRM.

ESTRUCTURA
----------

Proyecto_transporte/
├── Datos/
│   ├── red.json
│   ├── vehiculo.json
│   ├── solicitudes_pequenas.json
│   ├── solicitudes_medianas.json
│   ├── solicitudes_grandes.json
│   ├── general_datos.py
│   ├── comparar_resultados.py
│   └── Esperados/
├── Python/
│   ├── src/Transporte/
│   ├── Test/
│   ├── Resultados/
│   └── benchmark.py
├── Go/
│   ├── cmd/transporte/
│   ├── Internal/
│   ├── Test/
│   └── go.mod
├── TypeScript/
│   ├── src/
│   ├── Test/
│   ├── dist/
│   └── package.json
├── Visualizacion/
│   ├── index.html
│   ├── estilos.css
│   ├── app.js
│   └── Datos/
├── Docs/
├── Evidencias/
├── pyproject.toml
└── uv.lock

DATOS COMPARTIDOS
-----------------

La red se encuentra en Datos/red.json. Contiene:

- ubicaciones: identificador y nombre.
- conexiones: origen, destino, distancia, tiempo base, costo y dirección.

Los vehículos están en Datos/vehiculo.json y las solicitudes en:

- Datos/solicitudes_pequenas.json: 10 solicitudes.
- Datos/solicitudes_medianas.json: 1,000 solicitudes.
- Datos/solicitudes_grandes.json: 10,000 solicitudes.

Los datos se generan de forma determinista con la semilla 301.

REGLAS DE NEGOCIO
-----------------

Ubicaciones y conexiones:

- El identificador de una ubicación es único.
- Las distancias, velocidades o tiempos base deben ser positivos.
- El costo por tramo debe ser positivo.
- Una conexión no puede dirigirse a sí misma.
- Las conexiones son bidireccionales cuando bidireccional es true.
- No se permiten ubicaciones inexistentes ni conexiones duplicadas.

Grafo:

- El grafo utiliza una lista de adyacencia.
- Dijkstra cambia su peso según el criterio elegido:
  - distancia: distancia en kilómetros.
  - tiempo: tiempo ajustado por tráfico.
  - costo: costo total del recorrido.

Tráfico:

Nivel  | Factor
-------|-------
Bajo   | 1.0
Medio  | 1.5
Alto   | 2.0

El tiempo ajustado de una conexión es:

tiempo_base_min × factor_de_tráfico

Desempate:

Las rutas se comparan en este orden:

1. Menor valor del criterio.
2. Menor número de conexiones.
3. Secuencia lexicográfica de identificadores.

Las rutas simples están limitadas a seis conexiones y no pueden repetir
ubicaciones.

Prioridades:

Prioridad | Plazo
----------|------------------
Critica   | 60 minutos
Alta      | 120 minutos
Media     | 480 minutos
Baja      | 1,440 minutos

El orden de atención es:

critica, alta, media, baja

Dentro de la misma prioridad se atiende primero el identificador lexicográfico.

Vehículos:

- Se asigna el vehículo disponible de menor identificador.
- Su capacidad debe ser mayor o igual al número de pasajeros.
- Al asignarse, el vehículo cambia a ocupado.
- Si no existe capacidad disponible, la solicitud pasa a en_cola.
- Al liberar un vehículo se puede reintentar la cola.

Procesamiento:

El lote se procesa en dos fases:

1. Validación y cálculo de rutas en paralelo.
2. Asignación de vehículos secuencialmente por prioridad.

Esta separación permite que la concurrencia no altere el resultado final.

GENERACIÓN DE DATOS
-------------------

Desde la raíz del proyecto:

python .\Datos\general_datos.py

El programa genera:

- Datos/red.json
- Datos/vehiculo.json
- Datos/solicitudes_pequenas.json
- Datos/solicitudes_medianas.json
- Datos/solicitudes_grandes.json

PYTHON
------

Python funciona como implementación de referencia.

Ejecutar el procesador:

$env:PYTHONPATH="$PWD\Python\src"
python .\Python\src\Transporte\main.py `
  --red .\Datos\red.json `
  --solicitudes .\Datos\solicitudes_pequenas.json `
  --vehiculos .\Datos\vehiculo.json `
  --modo secuencial

Ejecutar la fase concurrente:

$env:PYTHONPATH="$PWD\Python\src"
python .\Python\src\Transporte\main.py `
  --red .\Datos\red.json `
  --solicitudes .\Datos\solicitudes_pequenas.json `
  --vehiculos .\Datos\vehiculo.json `
  --modo concurrente

GO
--

Desde Go:

cd .\Go
go mod download
go test ./...
go build ./cmd/transporte

Ejecutar:

go run .\cmd\transporte `
  -red ..\Datos\red.json `
  -solicitudes ..\Datos\solicitudes_pequenas.json `
  -vehiculos ..\Datos\vehiculo.json

Para volver a la raíz:

cd ..

TYPESCRIPT
----------

Desde TypeScript:

cd .\TypeScript
npm install
npm run build
npm test

Ejecutar el programa compilado:

node .\dist\src\main.js `
  ..\Datos\red.json `
  ..\Datos\solicitudes_pequenas.json `
  ..\Datos\vehiculo.json

Para volver a la raíz:

cd ..

VISUALIZACIÓN WEB
-----------------

La visualización utiliza HTML, CSS, JavaScript, Leaflet, OpenStreetMap y OSRM.

Iniciar el servidor local desde la raíz:

python -m http.server 8766 --directory .\Visualizacion

Abrir:

http://localhost:8766

La interfaz permite:

- Registrar ubicaciones mediante coordenadas.
- Seleccionar puntos directamente en el mapa.
- Registrar conexiones.
- Elegir criterios de ruta.
- Consultar distancia, tiempo y costo.
- Cambiar entre pesos mexicanos y dólares.
- Mostrar varias rutas posibles.
- Registrar vehículos y solicitudes.
- Visualizar rutas reales siguiendo las calles.
- Consultar vehículos disponibles y ocupados.

Los datos de la interfaz se guardan temporalmente en localStorage.

PRUEBAS
-------

Python:

$env:PYTHONPATH="$PWD\Python\src"
python -m unittest discover -s .\Python\Test -v

Las pruebas verifican rutas, rutas posibles, asignaciones y solicitudes inválidas.

Go:

cd .\Go
gofmt -w ./...
go test ./...
cd ..

TypeScript:

cd .\TypeScript
npm test
cd ..

BENCHMARKS
----------

El benchmark de Python se ejecuta desde la raíz:

$env:PYTHONPATH="$PWD\Python\src"
python .\Python\benchmark.py

Los resultados se guardan en:

Python/Resultados/python_benchmark.json

El archivo mide lotes pequeños, medianos y grandes en modo secuencial.

COMPARACIÓN DE RESULTADOS
-------------------------

Python genera los resultados de referencia en:

Datos/Esperados/pequenas.json
Datos/Esperados/medias.json
Datos/Esperados/grandes.json

Se puede comparar un resultado con un esperado:

python .\Datos\comparar_resultados.py `
  .\Python\Resultados\resultado.json `
  .\Datos\Esperados\pequenas.json

El comparador ignora campos de medición como lenguaje, tamano, modo y tiempo_ms,
y permite una tolerancia numérica de 0.01.

ERRORES
-------

Código                  | Significado
------------------------|-------------------------------------------
datos_invalidos         | Datos incompletos o fuera de regla
ubicacion_inexistente   | El origen o destino no existe
origen_igual_destino    | Origen y destino son iguales
ruta_no_encontrada      | No existe una ruta simple válida
archivo_no_encontrada   | El archivo solicitado no existe
json_invalido           | El contenido no es un JSON válido

Una solicitud inválida se marca como rechazada, pero no detiene el procesamiento
de las demás solicitudes.

ESTADO ACTUAL
-------------

El proyecto incluye la red compartida, los tres lotes de solicitudes, los
resultados esperados, pruebas básicas, benchmarks y una visualización interactiva.

Los puntos principales por mantener bajo control son:

- Confirmar la equivalencia completa de Go y TypeScript con el formato final.
- Completar la concurrencia en los tres lenguajes.
- Generar benchmarks comparativos finales.
- Agregar más pruebas de empate, tráfico, cola y casos inválidos.
- Completar manual técnico, diagramas y evidencias finales.

REFERENCIAS TÉCNICAS
--------------------

- Dijkstra: E. W. Dijkstra, “A Note on Two Problems in Connexion with Graphs”.
- Leaflet: https://leafletjs.com/reference.html
- OpenStreetMap: https://www.openstreetmap.org/
- OSRM: https://project-osrm.org/docs/v5.24.0/api/
```
