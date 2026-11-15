import { cargar_grafo, cargar_solicitudes, cargar_vehiculos } from "./ioDatos";
import { procesar } from "./procesador";

/** CLI: node dist/src/main.js red.json solicitudes.json vehiculos.json */
export function main(args = process.argv.slice(2)): void {
  if (args.length !== 3) {
    console.error("Uso: main <red.json> <solicitudes.json> <vehiculo.json>");
    return;
  }
  const resultado = procesar(cargar_grafo(args[0]), cargar_solicitudes(args[1]), cargar_vehiculos(args[2]));
  console.log(JSON.stringify(resultado.a_dict(), null, 2));
}

if (require.main === module) main();
