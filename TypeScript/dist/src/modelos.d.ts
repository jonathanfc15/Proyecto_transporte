export declare class Nodo {
    readonly id: string;
    readonly nombre?: string | undefined;
    constructor(id: string, nombre?: string | undefined);
}
export declare class Arista {
    readonly origen: string;
    readonly destino: string;
    readonly distancia: number;
    readonly tiempo?: number | undefined;
    readonly bidireccional: boolean;
    constructor(origen: string, destino: string, distancia: number, tiempo?: number | undefined, bidireccional?: boolean);
}
export declare class Solicitud {
    readonly id: string;
    readonly origen: string;
    readonly destino: string;
    readonly peso: number;
    readonly prioridad: number;
    readonly ventana_inicio?: number | undefined;
    readonly ventana_fin?: number | undefined;
    constructor(id: string, origen: string, destino: string, peso?: number, prioridad?: number, ventana_inicio?: number | undefined, ventana_fin?: number | undefined);
    get demanda(): number;
}
export declare class Vehiculo {
    readonly id: string;
    readonly origen: string;
    readonly capacidad: number;
    readonly velocidad: number;
    readonly disponible: boolean;
    constructor(id: string, origen: string, capacidad: number, velocidad?: number, disponible?: boolean);
    get ubicacion(): string;
}
export declare class Ruta {
    readonly nodos: string[];
    readonly distancia: number;
    readonly tiempo: number;
    constructor(nodos: string[], distancia: number, tiempo: number);
    get costo(): number;
    get origen(): string;
    get destino(): string;
}
export declare class Asignacion {
    readonly solicitud: Solicitud;
    readonly vehiculo: Vehiculo;
    readonly ruta: Ruta;
    constructor(solicitud: Solicitud, vehiculo: Vehiculo, ruta: Ruta);
    get costo(): number;
}
export declare class Resultado {
    readonly asignaciones: Asignacion[];
    readonly no_asignadas: Solicitud[];
    readonly distancia_total: number;
    readonly tiempo_total: number;
    constructor(asignaciones?: Asignacion[], no_asignadas?: Solicitud[], distancia_total?: number, tiempo_total?: number);
    a_dict(): Record<string, unknown>;
}
