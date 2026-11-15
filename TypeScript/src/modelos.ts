import { CAPACIDAD_MINIMA, DISTANCIA_MINIMA, VELOCIDAD_MINIMA, ValidacionError } from "./errores";

export class Nodo {
  constructor(public readonly id: string, public readonly nombre?: string) {
    if (!String(id).trim()) throw new ValidacionError("El identificador del nodo es obligatorio");
  }
}

export class Arista {
  constructor(
    public readonly origen: string,
    public readonly destino: string,
    public readonly distancia: number,
    public readonly tiempo?: number,
    public readonly bidireccional = true,
  ) {
    if (!Number.isFinite(distancia) || distancia < DISTANCIA_MINIMA)
      throw new ValidacionError("La distancia no puede ser negativa");
    if (tiempo !== undefined && (!Number.isFinite(tiempo) || tiempo < 0))
      throw new ValidacionError("El tiempo no puede ser negativo");
  }
}

export class Solicitud {
  constructor(
    public readonly id: string,
    public readonly origen: string,
    public readonly destino: string,
    public readonly peso = 0,
    public readonly prioridad = 0,
    public readonly ventana_inicio?: number,
    public readonly ventana_fin?: number,
  ) {
    if (!id || !origen || !destino) throw new ValidacionError("La solicitud requiere id, origen y destino");
    if (!Number.isFinite(peso) || peso < 0) throw new ValidacionError("El peso de la solicitud no puede ser negativo");
    if (ventana_inicio !== undefined && ventana_fin !== undefined && ventana_fin < ventana_inicio)
      throw new ValidacionError("La ventana de tiempo es inválida");
  }
  get demanda(): number { return this.peso; }
}

export class Vehiculo {
  constructor(
    public readonly id: string,
    public readonly origen: string,
    public readonly capacidad: number,
    public readonly velocidad = 1,
    public readonly disponible = true,
  ) {
    if (!id || !origen) throw new ValidacionError("El vehículo requiere id y origen");
    if (!Number.isFinite(capacidad) || capacidad < CAPACIDAD_MINIMA)
      throw new ValidacionError("La capacidad no puede ser negativa");
    if (!Number.isFinite(velocidad) || velocidad <= VELOCIDAD_MINIMA)
      throw new ValidacionError("La velocidad debe ser positiva");
  }
  get ubicacion(): string { return this.origen; }
}

export class Ruta {
  constructor(public readonly nodos: string[], public readonly distancia: number, public readonly tiempo: number) {}
  get costo(): number { return this.distancia; }
  get origen(): string { return this.nodos[0]; }
  get destino(): string { return this.nodos[this.nodos.length - 1]; }
}

export class Asignacion {
  constructor(public readonly solicitud: Solicitud, public readonly vehiculo: Vehiculo, public readonly ruta: Ruta) {}
  get costo(): number { return this.ruta.costo; }
}

export class Resultado {
  constructor(
    public readonly asignaciones: Asignacion[] = [],
    public readonly no_asignadas: Solicitud[] = [],
    public readonly distancia_total = 0,
    public readonly tiempo_total = 0,
  ) {}
  a_dict(): Record<string, unknown> {
    const plain = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(plain);
      if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as object).map(([k, v]) => [k, plain(v)]));
      }
      return value;
    };
    return {
      asignaciones: plain(this.asignaciones),
      no_asignadas: plain(this.no_asignadas),
      distancia_total: this.distancia_total,
      tiempo_total: this.tiempo_total,
    };
  }
}
