import { NodoInexistenteError, RutaInexistenteError } from "./errores";
import { Arista, Nodo, Ruta } from "./modelos";

export class Grafo {
  readonly adyacencia = new Map<string, Arista[]>();
  get nodos(): Set<string> { return new Set(this.adyacencia.keys()); }

  agregar_nodo(nodo: Nodo | string): void {
    const id = typeof nodo === "string" ? nodo : nodo.id;
    if (!this.adyacencia.has(id)) this.adyacencia.set(id, []);
  }

  agregar_arista(arista: Arista, destino?: string, distancia?: number): void {
    const edge = arista instanceof Arista
      ? arista
      : new Arista(String(arista), String(destino), distancia ?? 0);
    this.agregar_nodo(edge.origen);
    this.agregar_nodo(edge.destino);
    this.adyacencia.get(edge.origen)!.push(edge);
    if (edge.bidireccional) {
      this.adyacencia.get(edge.destino)!.push(
        new Arista(edge.destino, edge.origen, edge.distancia, edge.tiempo, false),
      );
    }
  }

  agregar_conexion(origen: string, destino: string, distancia: number, tiempo?: number, bidireccional = true): void {
    this.agregar_arista(new Arista(origen, destino, distancia, tiempo, bidireccional));
  }

  vecinos(nodo: string): Arista[] {
    if (!this.adyacencia.has(nodo)) throw new NodoInexistenteError(`Nodo inexistente: ${nodo}`);
    return [...this.adyacencia.get(nodo)!];
  }

  ruta_minima(origen: string, destino: string): Ruta {
    if (!this.adyacencia.has(origen) || !this.adyacencia.has(destino))
      throw new NodoInexistenteError(`Nodo inexistente: ${origen} o ${destino}`);
    const cola: Array<[number, string]> = [[0, origen]];
    const dist = new Map<string, number>([[origen, 0]]);
    const anterior = new Map<string, [string, Arista]>();
    while (cola.length) {
      cola.sort((a, b) => a[0] - b[0]);
      const [costo, actual] = cola.shift()!;
      if (costo !== dist.get(actual)) continue;
      if (actual === destino) break;
      for (const arista of this.adyacencia.get(actual)!) {
        const nuevo = costo + arista.distancia;
        if (nuevo < (dist.get(arista.destino) ?? Infinity)) {
          dist.set(arista.destino, nuevo);
          anterior.set(arista.destino, [actual, arista]);
          cola.push([nuevo, arista.destino]);
        }
      }
    }
    if (!dist.has(destino)) throw new RutaInexistenteError(`No existe ruta de ${origen} a ${destino}`);
    const nodos = [destino];
    let actual = destino;
    let tiempo = 0;
    while (actual !== origen) {
      const previo = anterior.get(actual);
      if (!previo) throw new RutaInexistenteError(`No existe ruta de ${origen} a ${destino}`);
      const [p, arista] = previo;
      nodos.push(p);
      tiempo += arista.tiempo ?? arista.distancia;
      actual = p;
    }
    return new Ruta(nodos.reverse(), dist.get(destino)!, tiempo);
  }

  camino_minimo(origen: string, destino: string): Ruta { return this.ruta_minima(origen, destino); }
  dijkstra(origen: string, destino: string): Ruta { return this.ruta_minima(origen, destino); }
}
