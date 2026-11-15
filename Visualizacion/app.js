/* FleetOS: interfaz autónoma con mapa Leaflet y datos locales. */
const KEY = "transporte-ui-v2", $ = s => document.querySelector(s);
const defaults = { ubicaciones:[{id:"A",nombre:"Terminal A",lat:19.4326,lng:-99.1332},{id:"B",nombre:"Terminal B",lat:19.427,lng:-99.167},{id:"C",nombre:"Terminal C",lat:19.451,lng:-99.14}], conexiones:[{origen:"A",destino:"B",distancia_km:4,tiempo_base_min:10,costo:5,bidireccional:true},{origen:"B",destino:"C",distancia_km:3,tiempo_base_min:8,costo:4,bidireccional:true},{origen:"A",destino:"C",distancia_km:10,tiempo_base_min:25,costo:12,bidireccional:true}],vehiculos:[],solicitudes:[]};
const traffic = {low:1, medium:1.25, high:1.6};
const tipoCambio = 18;
const simbolosMoneda = {MXN:"$ MXN",USD:"US$"};
const models = [{nombre:"camion cisterna",imagen:"https://www.bansarchina.com/wp-content/uploads/2025/10/tanker-truck.jpg"},{nombre:"Camión de volteo",imagen:"https://covarza.com/wp-content/uploads/2024/09/volteo7m3.jpg"},{nombre:"Camión contenedor",imagen:"https://preview.free3d.com/img/2019/11/2408238279255131864/2jxdn58l.jpg"}];
let state = readState(), map, chart, selectedModel = "camion cisterna", selectedPoint = null, mapLayers, routeLayer;
const geometriaCallesCache = new Map();
let numeroSolicitudRuta = 0;
let numeroRenderMapa = 0;

function normalize(x){return {ubicaciones:Array.isArray(x.ubicaciones)?x.ubicaciones:[],conexiones:Array.isArray(x.conexiones)?x.conexiones:[],vehiculos:Array.isArray(x.vehiculos)?x.vehiculos:[],solicitudes:Array.isArray(x.solicitudes)?x.solicitudes:[]}}
function readState(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||"null")||defaults)}catch{return normalize(defaults)}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notify("No se pudo guardar en localStorage")}renderAll()}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function notify(t){const x=$("#toast");x.textContent=t;x.style.display="block";setTimeout(()=>x.style.display="none",2200)}
function validCoords(lat,lng){return Number.isFinite(+lat)&&Number.isFinite(+lng)&&+lat>=-90&&+lat<=90&&+lng>=-180&&+lng<=180}
function point(x,i){return validCoords(x.lat,x.lng)?[+x.lat,+x.lng]:null}
function opts(empty=true){return (empty?'<option value="">Selecciona…</option>':"")+state.ubicaciones.map(x=>`<option value="${esc(x.id)}">${esc(x.id)} · ${esc(x.nombre)}</option>`).join("")}
function refreshSelects(){["route-from","route-to","edge-from","edge-to","request-from","request-to"].forEach(k=>{const e=$("#"+k),v=e.value;e.innerHTML=opts();if([...e.options].some(o=>o.value===v))e.value=v})}

/* Leaflet API: https://leafletjs.com/reference.html
   Tiles de OpenStreetMap según su política: https://operations.osmfoundation.org/policies/tiles/ */
function renderMap(){
  const box=$("#network"); if(!box)return;
  if(!window.L){$("#net-fallback").textContent="Leaflet no está disponible; no se puede mostrar el mapa.";return}
  if(!map){
    map=L.map(box,{zoomControl:true,preferCanvas:true}).setView([19.435,-99.15],12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:19}).addTo(map);
    L.control.scale({metric:true,imperial:false,maxWidth:150,position:"bottomleft"}).addTo(map);
    map.on("click",e=>{selectedPoint={lat:e.latlng.lat,lng:e.latlng.lng};updateSelectedPoint();renderMap()});
  }
  if(mapLayers)map.removeLayer(mapLayers); if(routeLayer)map.removeLayer(routeLayer);
  mapLayers=L.layerGroup().addTo(map); routeLayer=L.layerGroup().addTo(map);
  const points=new Map();
  state.ubicaciones.forEach((x,i)=>{const p=point(x,i);if(!p)return;const m=L.circleMarker(p,{radius:9,fillColor:"#d6815e",color:"#351a14",weight:3,fillOpacity:1}).addTo(mapLayers);m.bindPopup(`<b>${esc(x.id)} · ${esc(x.nombre)}</b><br><small>${p[0].toFixed(4)}, ${p[1].toFixed(4)}</small>`);points.set(x.id,p)});
  if(selectedPoint)L.circleMarker([selectedPoint.lat,selectedPoint.lng],{radius:10,fillColor:"#e0a15f",color:"#fff0dc",weight:3,fillOpacity:1}).bindPopup("Punto seleccionado").addTo(mapLayers);
  if(state.ubicaciones.length&&points.size){
    const bounds=L.latLngBounds([...points.values()]);
    map.fitBounds(bounds,{padding:[35,35],maxZoom:15});
  }
  $("#net-fallback").textContent=state.ubicaciones.some((x,i)=>!point(x,i))?"Hay ubicaciones con coordenadas inválidas; corrígelas para mostrarlas.":"";
  dibujarConexionesPorCalles(++numeroRenderMapa);
}
function updateSelectedPoint(){if(!selectedPoint)return;$("#loc-lat").value=selectedPoint.lat.toFixed(6);$("#loc-lng").value=selectedPoint.lng.toFixed(6);$("#coordinate-help").textContent=`Punto seleccionado: ${selectedPoint.lat.toFixed(6)}, ${selectedPoint.lng.toFixed(6)}`}
function listRender(){
  $("#locations-list").innerHTML=state.ubicaciones.map(x=>`<div class="item"><span><b>${esc(x.id)}</b> ${esc(x.nombre)} <small>${validCoords(x.lat,x.lng)?`${(+x.lat).toFixed(4)}, ${(+x.lng).toFixed(4)}`:"sin coordenadas válidas"}</small></span><button data-del-loc="${esc(x.id)}">Eliminar</button></div>`).join("")||'<span class="muted">No hay ubicaciones.</span>';
  $("#edges-list").innerHTML=state.conexiones.map((x,i)=>`<div class="item"><span>${esc(x.origen)} → ${esc(x.destino)} <small>${x.distancia_km||0} Km · ${(x.costo||0).toFixed?.(2)||x.costo||0} MXN/Km · total ${((x.distancia_km||0)*(x.costo||0)).toFixed(2)} MXN</small></span><button data-del-edge="${i}">Eliminar</button></div>`).join("")||'<span class="muted">No hay conexiones.</span>';
  $("#vehicles-list").innerHTML=state.vehiculos.map(x=>`<div class="item"><span>🚚 <b>${esc(x.id)}</b> · ${esc(x.modelo)} <small>${x.capacidad||0} kg · ${x.ocupado?"ocupado":"disponible"}</small></span><button data-del-vehicle="${esc(x.id)}">Eliminar</button></div>`).join("")||'<span class="muted">No hay vehículos.</span>';
  $("#requests-list").innerHTML=state.solicitudes.map(x=>`<div class="item"><span>📦 <b>${esc(x.descripcion)}</b> · ${esc(x.origen)} → ${esc(x.destino)} <small>${x.peso||0} kg</small></span></div>`).join("")||'<span class="muted">No hay solicitudes.</span>';
  $("#metric-locations").textContent=state.ubicaciones.length;$("#metric-edges").textContent=state.conexiones.length;$("#metric-vehicles").textContent=state.vehiculos.filter(x=>!x.ocupado).length;$("#metric-requests").textContent=state.solicitudes.filter(x=>x.estado==="pendiente").length;
}
function neighbors(a){return state.conexiones.flatMap(e=>e.origen===a?[{to:e.destino,e}]:e.bidireccional&&e.destino===a?[{to:e.origen,e}]:[])}
function costoTramo(e){return (+e.distancia_km||0)*(+e.costo||0)}
function weight(e,c,t){return c==="distance"?+e.distancia_km||0:c==="cost"?costoTramo(e):(+e.tiempo_base_min||0)*traffic[t]}
/* Dijkstra basado en E. W. Dijkstra, “A Note on Two Problems in Connexion with Graphs”,
   Numerische Mathematik 1 (1959), DOI: 10.1007/BF01386390. */
function dijkstra(from,to,c,t){
  const dist=new Map(state.ubicaciones.map(x=>[x.id,Infinity])),prev=new Map(),unvisited=new Set(dist.keys());dist.set(from,0);
  while(unvisited.size){let u=[...unvisited].reduce((a,b)=>dist.get(b)<dist.get(a)?b:a);unvisited.delete(u);if(!Number.isFinite(dist.get(u)))break;if(u===to)break;
    for(const n of neighbors(u)){const alt=dist.get(u)+weight(n.e,c,t);if(alt<dist.get(n.to)){dist.set(n.to,alt);prev.set(n.to,{from:u,e:n.e})}}
  }
  if(!Number.isFinite(dist.get(to)))return null;const nodes=[to],edges=[];for(let u=to;u!==from;){const p=prev.get(u);if(!p)return null;edges.unshift(p.e);nodes.unshift(p.from);u=p.from}return {nodes,edges,total:dist.get(to)}
}
function routes(from,to,path=[from],seen=new Set([from])){if(from===to)return[{nodes:path,edges:[]}];let out=[];for(const {to:n,e} of neighbors(from))if(!seen.has(n))for(const r of routes(n,to,[...path,n],new Set([...seen,n])))out.push({nodes:r.nodes,edges:[e,...r.edges]});return out}
function score(r,c,t="low"){return r.edges.reduce((a,e)=>a+weight(e,c,t),0)}
function dinero(cantidad,moneda){
  const valor=moneda==="USD"?cantidad/tipoCambio:cantidad;
  return `${simbolosMoneda[moneda]} ${valor.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
/*
 * OSRM devuelve la geometría de una ruta siguiendo las calles de OpenStreetMap.
 * Documentación: https://project-osrm.org/docs/v5.24.0/api/#route-service
 * Si no hay conexión, se usa la geometría de los nodos como respaldo local.
 */
async function geometriaPorCalles(r){
  const ubicaciones = r.nodes.map(id=>state.ubicaciones.find(x=>x.id===id));
  if(ubicaciones.some(x=>!x||!validCoords(x.lat,x.lng)))return null;
  const coordenadas = ubicaciones.map(x=>`${+x.lng},${+x.lat}`).join(";");
  if(geometriaCallesCache.has(coordenadas))return geometriaCallesCache.get(coordenadas);
  const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson&steps=false`;
  try{
    const respuesta = await fetch(url);
    if(!respuesta.ok)throw new Error(`OSRM respondió ${respuesta.status}`);
    const datos = await respuesta.json();
    const geometria = datos.code==="Ok"&&datos.routes?.[0]?.geometry?.coordinates
      ? datos.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]) : null;
    if(geometria)geometriaCallesCache.set(coordenadas,geometria);
    return geometria;
  }catch(error){
    console.warn("No se pudo obtener la geometría de las calles:",error);
    return null;
  }
}
async function dibujarConexionesPorCalles(renderActual){
  const conexiones = state.conexiones.map(e=>({
    e,
    a:state.ubicaciones.find(x=>x.id===e.origen),
    b:state.ubicaciones.find(x=>x.id===e.destino)
  })).filter(x=>x.a&&x.b&&validCoords(x.a.lat,x.a.lng)&&validCoords(x.b.lat,x.b.lng));
  const resultados = await Promise.all(conexiones.map(async ({e,a,b})=>{
    const geometria = await geometriaPorCalles({nodes:[a.id,b.id]});
    return {e,geometria};
  }));
  if(renderActual!==numeroRenderMapa||!mapLayers)return;
  resultados.forEach(({e,geometria})=>{
    const a=pointsForConnection(e,"origen"),b=pointsForConnection(e,"destino");
    const coordenadas=geometria||(a&&b?[a,b]:null);
    if(!coordenadas)return;
    const linea = L.polyline(coordenadas,{
      color:"#9d5a43",weight:3,opacity:.72,
      dashArray:e.bidireccional?"":"8 6"
    });
    linea.addTo(mapLayers);
  });
}
function pointsForConnection(e,extremo){
  const ubicacion=state.ubicaciones.find(x=>x.id===e[extremo]);
  return ubicacion?point(ubicacion):null;
}
async function highlightRoute(r){
  if(!map||!r||!routeLayer)return;
  const solicitud = ++numeroSolicitudRuta;
  const respaldo = r.nodes.map(id=>point(state.ubicaciones.find(x=>x.id===id)));
  if(!respaldo.every(Boolean))return;
  routeLayer.clearLayers();
  const geometria = await geometriaPorCalles(r);
  if(solicitud!==numeroSolicitudRuta||!routeLayer)return;
  const coordenadas = geometria||respaldo;
  $("#net-fallback").textContent = geometria
    ? "Ruta calculada por las calles de OpenStreetMap."
    : "No se pudo consultar la red vial; se muestra una conexión directa de respaldo.";
  L.polyline(coordenadas,{color:"#f0b37f",weight:8,opacity:.95,lineJoin:"round",lineCap:"round"})
    .addTo(routeLayer).bindTooltip(geometria?"Ruta óptima por calles":"Ruta óptima (geometría de respaldo)");
}
function calc(){
  const a=$("#route-from").value,b=$("#route-to").value,c=$("#criterion").value,t=$("#traffic").value;if(routeLayer)routeLayer.clearLayers();
  if(!a||!b||a===b){$("#route-result").innerHTML="";$("#all-routes").innerHTML="";return}
  const moneda=$("#currency").value,r=dijkstra(a,b,c,t),rs=routes(a,b).sort((x,y)=>score(x,c,t)-score(y,c,t));if(!r){numeroSolicitudRuta++;$("#route-result").innerHTML="<p class=muted>No existe una ruta entre estos puntos.</p>";$("#all-routes").innerHTML="";return}
  highlightRoute(r);$("#route-result").innerHTML=`<div class="route"><b>Ruta óptima (${esc(c)}): ${r.nodes.join(" → ")}</b><br><small>${score(r,"distance").toFixed(1)} km · ${score(r,"time",t).toFixed(0)} min · ${score(r,"cost").toFixed(1)} u · trazado por calles</small></div>`;$("#route-count").textContent=`(${rs.length})`;$("#all-routes").innerHTML=rs.map((x,i)=>`<div class=item><span>${i+1}. ${x.nodes.join(" → ")}</span><small>${score(x,"distance").toFixed(1)} km · ${score(x,"time",t).toFixed(0)} min · ${score(x,"cost").toFixed(1)} u</small></div>`).join("")
  highlightRoute(r);$("#route-result").innerHTML=`<div class="route"><b>Ruta óptima (${esc(c)}): ${r.nodes.join(" → ")}</b><br><small>${score(r,"distance").toFixed(1)} Km · ${score(r,"time",t).toFixed(0)} min · ${dinero(score(r,"cost"),moneda)}</small></div>`;$("#route-count").textContent=`(${rs.length})`;$("#all-routes").innerHTML=rs.map((x,i)=>`<div class=item><span><b>Ruta ${i+1}</b> · ${x.nodes.join(" → ")}</span><small>${score(x,"distance").toFixed(1)} Km · ${score(x,"time",t).toFixed(0)} min · ${dinero(score(x,"cost"),moneda)}</small></div>`).join("")
}
function renderAll(){refreshSelects();renderMap();listRender();calc()}
async function load(){try{const r=await fetch("Datos/red.json");if(r.ok&&!localStorage.getItem(KEY)){const x=await r.json();state=normalize({...defaults,...x,vehiculos:[],solicitudes:[]})}}catch{}renderAll();$("#status").innerHTML="<i></i> Listo · memoria local";loadChart()}
async function loadChart(){if(!window.Chart)return;try{const x=await (await fetch("Datos/comparativa.json")).json(),labels=(x.casos||[]).map(c=>c.caso);chart=new Chart($("#benchmark"),{type:"bar",data:{labels,datasets:(x.implementaciones||[]).map((d,i)=>({label:d.nombre,data:d.tiempos,backgroundColor:["#e0a15f","#d6815e","#b85f43"][i%3],borderRadius:5}))},options:{responsive:true,plugins:{legend:{labels:{color:"#f0ded5"}}}}})}catch{}}
function eventSetup(){
  document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button,.tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active");if(b.dataset.tab==="red"&&map)setTimeout(()=>map.invalidateSize(),50)});
  $("#route-form").onsubmit=e=>{e.preventDefault();calc()};$("#traffic").onchange=calc;$("#criterion").onchange=calc;$("#currency").onchange=calc;
  $("#use-selected-point").onclick=()=>selectedPoint?updateSelectedPoint():notify("Haz clic en el mapa para seleccionar un punto");
  $("#location-form").onsubmit=e=>{e.preventDefault();const lat=$("#loc-lat").value.trim(),lng=$("#loc-lng").value.trim();if((lat&&!lng)||(!lat&&lng)||((lat||lng)&&!validCoords(lat,lng)))return notify("Latitud y longitud deben ser válidas y estar completas");const x={id:$("#loc-id").value.trim(),nombre:$("#loc-name").value.trim()};if(lat){x.lat=+lat;x.lng=+lng}if(!x.id||!x.nombre||state.ubicaciones.some(a=>a.id===x.id))return notify("ID repetido o datos inválidos");state.ubicaciones.push(x);e.target.reset();selectedPoint=null;$("#coordinate-help").textContent="Haz clic en el mapa para seleccionar coordenadas.";save();notify("Ubicación registrada")};
  $("#edge-form").onsubmit=e=>{e.preventDefault();const distancia=+$("#edge-distance").value,velocidad=+$("#edge-speed").value,tarifa=+$("#edge-cost").value,x={origen:$("#edge-from").value,destino:$("#edge-to").value,distancia_km:distancia,tiempo_base_min:distancia/velocidad*60,costo:tarifa,bidireccional:$("#edge-bidir").checked};if(!x.origen||!x.destino||x.origen===x.destino||![x.distancia_km,velocidad,x.costo].every(Number.isFinite)||x.distancia_km<=0||velocidad<=0||x.costo<0)return notify("Datos de conexión inválidos");state.conexiones.push(x);save();notify("Conexión registrada")};
  $("#vehicle-form").onsubmit=e=>{e.preventDefault();const x={id:$("#vehicle-id").value.trim(),capacidad:+$("#vehicle-capacity").value,modelo:selectedModel,ocupado:false};if(!x.id||state.vehiculos.some(a=>a.id===x.id))return notify("Vehículo repetido");state.vehiculos.push(x);e.target.reset();save();notify("Vehículo registrado")};
  $("#request-form").onsubmit=e=>{e.preventDefault();const x={id:"S-"+Date.now(),descripcion:$("#request-desc").value,origen:$("#request-from").value,destino:$("#request-to").value,peso:+$("#request-weight").value,estado:"pendiente"};if(!x.origen||!x.destino||x.origen===x.destino)return notify("Selecciona origen y destino diferentes");state.solicitudes.push(x);e.target.reset();save();notify("Solicitud registrada")};
  $("#process-all").onclick=()=>{const out=state.solicitudes.filter(x=>x.estado==="pendiente").map(x=>{const v=state.vehiculos.find(a=>!a.ocupado&&a.capacidad>=x.peso),r=dijkstra(x.origen,x.destino,"distance","low");if(v&&r){v.ocupado=true;x.estado="asignada";return`${x.descripcion}: ${v.id} · ${r.nodes.join(" → ")}`}return`${x.descripcion}: pendiente`});$("#process-result").innerHTML=out.map(x=>`<div class=route>${esc(x)}</div>`).join("")||"No hay solicitudes pendientes";save()};
  $("#toggle-busy").onclick=()=>{$("#vehicles-list").innerHTML=state.vehiculos.filter(x=>x.ocupado).map(x=>`<div class=item>🚚 ${esc(x.id)} · ocupado</div>`).join("")||"<span class=muted>No hay vehículos ocupados</span>"};
  document.addEventListener("click",e=>{const d=e.target.dataset;if(d.delLoc){state.ubicaciones=state.ubicaciones.filter(x=>x.id!==d.delLoc);state.conexiones=state.conexiones.filter(x=>x.origen!==d.delLoc&&x.destino!==d.delLoc);save()}if(d.delEdge){state.conexiones.splice(+d.delEdge,1);save()}if(d.delVehicle){state.vehiculos=state.vehiculos.filter(x=>x.id!==d.delVehicle);save()}});
  $("#reset-data").onclick=()=>{localStorage.removeItem(KEY);state=normalize(defaults);renderAll();notify("Datos restaurados")};
  models.forEach((m,i)=>{const b=document.createElement("div");b.className="model"+(i?"":" selected");b.dataset.model=m.nombre;b.innerHTML=`<img class=truck-photo src="${m.imagen}" alt="Camión ${m.nombre}" loading=lazy><strong>${m.nombre}</strong>`;b.onclick=()=>{document.querySelectorAll(".model").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selectedModel=m.nombre};$("#models").append(b)})
}
addEventListener("DOMContentLoaded",()=>{eventSetup();load()});
