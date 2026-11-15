"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const ioDatos_1 = require("./ioDatos");
const procesador_1 = require("./procesador");
/** CLI: node dist/src/main.js red.json solicitudes.json vehiculos.json */
function main(args = process.argv.slice(2)) {
    if (args.length !== 3) {
        console.error("Uso: main <red.json> <solicitudes.json> <vehiculo.json>");
        return;
    }
    const resultado = (0, procesador_1.procesar)((0, ioDatos_1.cargar_grafo)(args[0]), (0, ioDatos_1.cargar_solicitudes)(args[1]), (0, ioDatos_1.cargar_vehiculos)(args[2]));
    console.log(JSON.stringify(resultado.a_dict(), null, 2));
}
if (require.main === module)
    main();
//# sourceMappingURL=main.js.map