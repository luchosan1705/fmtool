import React, { useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from '@emotion/styled';
import './App.css';

// Componente de tabla estilizado
const StyledTable = styled.table`
width: 100%;
border-collapse: separate;
border-spacing: 0;
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
border-radius: 8px;
overflow: hidden;
`;

const TableHeader = styled.thead`
background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
color: white;
`;

const TableRow = styled.tr`
&:nth-of-type(even) {
background-color: #f8f9fa;
}
&:hover {
background-color: #e9ecef;
}
`;

const TableCell = styled.td`
padding: 12px 15px;
border-bottom: 1px solid #dee2e6;
`;

const TableHeaderCell = styled.th`
padding: 15px;
text-align: left;
cursor: pointer;
position: relative;
&:hover {
background-color: rgba(255, 255, 255, 0.1);
}
&::after {
content: '↕';
position: absolute;
right: 8px;
top: 50%;
transform: translateY(-50%);
font-size: 12px;
opacity: 0.6;
}
&[aria-sort="ascending"]::after {
content: '↑';
opacity: 1;
}
&[aria-sort="descending"]::after {
content: '↓';
opacity: 1;
}
`;

const Container = styled.div`
max-width: 1200px;
margin: 0 auto;
padding: 20px;
`;

function App() {
const [jugadores, setJugadores] = useState([]);
const [cargando, setCargando] = useState(false);
const [archivoCargado, setArchivoCargado] = useState(false);
const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
// Mapeo de atributos
const mapeoAtributos = {
"Cór": "Saques de esquina",
"Reg": "Regate",
"Rem": "Remate",
"Ctr": "Control",
"Lib": "Tiros Libres",
"Cen": "Centros",
"Cab": "Cabeceo",
"Lej": "Tiros Lejanos",
"Sq L": "Saques Largos",
"Mar": "Marcaje",
"Pas": "Pases",
"Pen": "Penales",
"Ent": "Entradas",
"Téc": "Técnica",
"Agr": "Agresividad",
"Ant": "Anticipacion",
"Val": "Valentia",
"Ser": "Serenidad",
"Cnc": "Concentracion",
"Dec": "Decisiones",
"Det": "Determinacion",
"Tal": "Talento",
"Lid": "Liderazgo",
"Dmq": "Desmarques",
"Col": "Colocacion",
"JEq": "Juego en Equipo",
"Vis": "Vision",
"Sac": "Sacrificio",
"Ace": "Aceleracion",
"Agi": "Agilidad",
"Equ": "Equilibro",
"Sal": "Alcance de Salto",
"Fís": "Recuperacion Fisica",
"Vel": "Velocidad",
"Res": "Resistencia",
"Fue": "Fuerza",
"Aér": "Alcance Aereo",
"Mdo": "Mando en el area",
"Com": "Comunicacion",
"Exc": "Excentricidad",
"Blo": "Blocaje",
"Pue": "Saques de Puerta",
"1v1": "Uno contra Uno",
"Puñ": "Golpeo de Puños",
"Ref": "Reflejos",
"SAL": "Salida",
"Saq": "Saque con la Mano"
};

const verDetalleJugador = (jugador) => {
setJugadorSeleccionado(jugador);
};

const volverATabla = () => {
setJugadorSeleccionado(null);
};

const calcularMedia = (jugador, atributos = null) => {
const camposNumericos = [];
const atributosACalcular = atributos || Object.keys(mapeoAtributos);
atributosACalcular.forEach((abreviatura) => {
if (jugador[abreviatura] !== undefined) {
const valor = jugador[abreviatura];
const valorNumerico = parseFloat(valor.toString().replace('%', ''));
if (!isNaN(valorNumerico)) {
camposNumericos.push(valorNumerico);
}
}
});
if (camposNumericos.length === 0) return '-';
const suma = camposNumericos.reduce((a, b) => a + b, 0);
return (suma*5 / camposNumericos.length).toFixed(1);
};
const gruposAtributos = {
// PORTEROS
"Portero (Defensa)": ["Mdo", "Com", "Blo", "Ref", "Saq", "1v1", "Ant", "Dec", "Col", "Cnc", "Agi", "Val"],
"Portero Cierre (Defensa)": ["Sal", "Mdo", "Ref", "1v1", "Ant", "Dec", "Col", "Cnc", "Ace", "Agi", "Vel"],
"Portero Cierre (Apoyo)": ["Sal", "Ref", "1v1", "Pas", "Ant", "Dec", "Vis", "Col", "Ser", "Cnc", "Ace", "Agi", "Vel"],
"Portero Cierre (Ataque)": ["Sal", "Ref", "1v1", "Pas", "Ctr", "Ant", "Dec", "Vis", "Ser", "Cnc", "Ace", "Agi", "Vel", "Exc"],

// DEFENSAS CENTRALES
"Defensa Central (Defender, Taponar)": ["Cab", "Mar", "Ent", "Fue", "Ant", "Dec", "Col", "Cnc", "Val", "Sal"],
"Defensa Central (Cubrir)": ["Cab", "Mar", "Ent", "Ant", "Dec", "Col", "Cnc", "Ace", "Vel", "Val"],
"Defensa con Toque (Defender, Taponar)": ["Cab", "Mar", "Ent", "Pas", "Téc", "Ant", "Dec", "Col", "Cnc", "Ser", "Vis"],
"Defensa con Toque (Cubrir)": ["Mar", "Ent", "Pas", "Téc", "Ant", "Dec", "Col", "Cnc", "Ser", "Vis", "Ace", "Vel"],
"Líbero (Apoyo)": ["Cab", "Ent", "Mar", "Pas", "Reg", "Téc", "Ant", "Dec", "Vis", "Col", "Cnc", "Ser", "Dmq"],
"Líbero (Ataque)": ["Pas", "Reg", "Rem", "Téc", "Ant", "Dec", "Vis", "Cnc", "Ser", "Dmq", "Tal"],

// LATERALES
"Lateral (Defender)": ["Cen", "Mar", "Ent", "Ant", "Dec", "Col", "Cnc", "Sac", "Res"],
"Lateral (Apoyo)": ["Cen", "Reg", "Mar", "Ent", "Ant", "Dec", "Col", "Cnc", "Sac", "Res"],
"Lateral (Ataque)": ["Cen", "Reg", "Ent", "Téc", "Ant", "Dec", "Dmq", "Cnc", "Sac", "Res", "Ace", "Vel"],
"Carrilero (Apoyo)": ["Cen", "Reg", "Téc", "Ant", "Dec", "Dmq", "Sac", "Res", "Ace", "Vel"],
"Carrilero (Ataque)": ["Cen", "Reg", "Téc", "Ant", "Dec", "Dmq", "Tal", "Sac", "Res", "Ace", "Vel"],
"Lateral Invertido (Defender)": ["Mar", "Ent", "Pas", "Ant", "Dec", "Col", "Cnc", "Ser", "Sac"],
"Lateral Invertido (Apoyo)": ["Mar", "Ent", "Pas", "Téc", "Ant", "Dec", "Vis", "Col", "Cnc", "Ser", "Sac", "Dmq"],

// MEDIOCENTROS DEFENSIVOS
"Pivote Defensivo (Defender)": ["Mar", "Ent", "Ant", "Dec", "Col", "Cnc", "Fue", "Val", "Cab"],
"Mediocentro Recuperador (Defender)": ["Ent", "Sac", "Ant", "Agr", "Res", "Val", "Fue"],
"Mediocentro Recuperador (Apoyo)": ["Ent", "Pas", "Sac", "Ant", "Agr", "Res", "Val"],
"Regista (Apoyo)": ["Pas", "Téc", "Ant", "Dec", "Vis", "Ser", "Dmq", "Tal", "Ctr"],
"Organizador en Juego Profundo (Defender)": ["Pas", "Téc", "Ant", "Dec", "Vis", "Col", "Cnc", "Ser"],
"Organizador en Juego Profundo (Apoyo)": ["Pas", "Téc", "Ant", "Dec", "Vis", "Ser", "Dmq", "Tal"],
// MEDIOCENTROS
"Centrocampista (Defender)": ["Ent", "Pas", "Dec", "Col", "Sac"],
"Centrocampista (Apoyo)": ["Ent", "Pas", "Rem", "Dec", "Dmq", "Sac"],
"Centrocampista (Ataque)": ["Pas", "Rem", "Ant", "Dec", "Dmq", "Tal"],
"Centrocampista Todoterreno (Apoyo)": ["Ent", "Pas", "Rem", "Sac", "Res", "Dec", "Dmq", "Fue"],
"Mezzala (Apoyo)": ["Pas", "Rem", "Reg", "Téc", "Dec", "Dmq", "Sac", "Ace"],
"Mezzala (Ataque)": ["Pas", "Rem", "Reg", "Téc", "Ant", "Dec", "Dmq", "Ace"],
"Organizador Itinerante (Apoyo)": ["Pas", "Reg", "Téc", "Vis", "Dec", "Dmq", "Ser", "Agi"],

// MEDIAPUNTAS
"Mediapunta (Apoyo)": ["Pas", "Rem", "Téc", "Dec", "Vis", "Dmq", "Ser"],
"Mediapunta (Ataque)": ["Pas", "Rem", "Téc", "Ant", "Dec", "Vis", "Dmq", "Ser"],
"Enganche (Ataque)": ["Pas", "Reg", "Téc", "Vis", "Dec", "Dmq", "Ser", "Tal", "Agi"],
"Trequartista (Ataque)": ["Pas", "Reg", "Téc", "Ant", "Vis", "Dec", "Dmq", "Ser", "Tal"],
"Falso Nueve (Apoyo)": ["Pas", "Reg", "Rem", "Téc", "Ant", "Dec", "Vis", "Dmq", "Ser"],

// EXTREMOS
"Extremo (Apoyo)": ["Cen", "Reg", "Téc", "Sac", "Ace", "Vel", "Agi"],
"Extremo (Ataque)": ["Cen", "Reg", "Téc", "Ant", "Dmq", "Ace", "Vel", "Agi"],
"Delantero Interior (Apoyo)": ["Rem", "Reg", "Pas", "Téc", "Dmq", "Ace", "Vel"],
"Delantero Interior (Ataque)": ["Rem", "Reg", "Téc", "Ant", "Dmq", "Ace", "Vel", "Ser"],
"Extremo Invertido (Apoyo)": ["Cen", "Reg", "Pas", "Téc", "Vis", "Dec", "Dmq"],
"Extremo Invertido (Ataque)": ["Cen", "Reg", "Pas", "Rem", "Téc", "Vis", "Dec", "Dmq"],

// DELANTEROS
"Delantero Avanzado (Ataque)": ["Rem", "Ctr", "Ant", "Dmq", "Ser", "Ace", "Vel"],
"Hombre Objetivo (Apoyo)": ["Cab", "Fue", "Sal", "Sac", "Val", "Rem", "Ctr"],
"Hombre Objetivo (Ataque)": ["Cab", "Fue", "Sal", "Ant", "Ser", "Val", "Rem", "Ctr"],
"Delantero Presionante (Defender)": ["Sac", "Res", "Agr", "Ant", "Dec", "Val", "Ace", "Fue"],
"Delantero Presionante (Apoyo)": ["Sac", "Res", "Agr", "Ant", "Dec", "Val", "Ace", "Pas", "Rem"],
"Delantero Presionante (Ataque)": ["Sac", "Res", "Agr", "Ant", "Dec", "Val", "Ace", "Rem", "Ctr"],
"Delantero Completo (Apoyo)": ["Rem", "Cab", "Pas", "Reg", "Téc", "Ant", "Dmq", "Ser", "Ace", "Vel", "Fue", "Sal"],
"Delantero Completo (Ataque)": ["Rem", "Cab", "Reg", "Téc", "Ant", "Dmq", "Ser", "Ace", "Vel", "Fue", "Sal"]
};

const columns = useMemo(() => [
{
Header: 'Nombre',
accessor: 'Nombre',
Cell: ({ row, value }) => (
<span
className="nombre-jugador"
onClick={() => verDetalleJugador(row.original)}
>
{value || '-'}
</span>
),
},
{
Header: 'Media General',
accessor: 'mediaGeneral',
Cell: ({ value }) => value || '-',
},
{
Header: 'Pierna Izq.',
accessor: 'Pierna izquierda',
Cell: ({ value }) => value || '-',
},
{
Header: 'Pierna Der.',
accessor: 'Pierna derecha',
Cell: ({ value }) => value || '-',
},
{
Header: 'Posición',
accessor: 'Posición',
Cell: ({ value }) => value || '-',
},
// PORTEROS
{
Header: 'Portero (Defensa)',
accessor: 'mediaPortero',
Cell: ({ value }) => value || '-',
},
{
Header: 'Portero Cierre (Defensa)',
accessor: 'mediaPorteroCierreDefensa',
Cell: ({ value }) => value || '-',
},
{
Header: 'Portero Cierre (Apoyo)',
accessor: 'mediaPorteroCierreApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Portero Cierre (Ataque)',
accessor: 'mediaPorteroCierreAtaque',
Cell: ({ value }) => value || '-',
},
// DEFENSAS CENTRALES
{
Header: 'Defensa Central (Defender, Taponar)',
accessor: 'mediaDefensaCentralDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Defensa Central (Cubrir)',
accessor: 'mediaDefensaCentralCubrir',
Cell: ({ value }) => value || '-',
},
{
Header: 'Defensa con Toque (Defender, Taponar)',
accessor: 'mediaDefensaConToqueDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Defensa con Toque (Cubrir)',
accessor: 'mediaDefensaConToqueCubrir',
Cell: ({ value }) => value || '-',
},
{
Header: 'Líbero (Apoyo)',
accessor: 'mediaLiberoApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Líbero (Ataque)',
accessor: 'mediaLiberoAtaque',
Cell: ({ value }) => value || '-',
},
// LATERALES
{
Header: 'Lateral (Defender)',
accessor: 'mediaLateralDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Lateral (Apoyo)',
accessor: 'mediaLateralApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Lateral (Ataque)',
accessor: 'mediaLateralAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Carrilero (Apoyo)',
accessor: 'mediaCarrileroApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Carrilero (Ataque)',
accessor: 'mediaCarrileroAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Lateral Invertido (Defender)',
accessor: 'mediaLateralInvertidoDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Lateral Invertido (Apoyo)',
accessor: 'mediaLateralInvertidoApoyo',
Cell: ({ value }) => value || '-',
},
// MEDIOCENTROS DEFENSIVOS
{
Header: 'Pivote Defensivo (Defender)',
accessor: 'mediaPivoteDefensivo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Mediocentro Recuperador (Defender)',
accessor: 'mediaMediocentroRecuperadorDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Mediocentro Recuperador (Apoyo)',
accessor: 'mediaMediocentroRecuperadorApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Regista (Apoyo)',
accessor: 'mediaRegista',
Cell: ({ value }) => value || '-',
},
{
Header: 'Organizador en Juego Profundo (Defender)',
accessor: 'mediaOrganizadorProfundoDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Organizador en Juego Profundo (Apoyo)',
accessor: 'mediaOrganizadorProfundoApoyo',
Cell: ({ value }) => value || '-',
},
// MEDIOCENTROS
{
Header: 'Centrocampista (Defender)',
accessor: 'mediaCentrocampistaDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Centrocampista (Apoyo)',
accessor: 'mediaCentrocampistaApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Centrocampista (Ataque)',
accessor: 'mediaCentrocampistaAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Centrocampista Todoterreno (Apoyo)',
accessor: 'mediaCentrocampistaTodoterreno',
Cell: ({ value }) => value || '-',
},
{
Header: 'Mezzala (Apoyo)',
accessor: 'mediaMezzalaApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Mezzala (Ataque)',
accessor: 'mediaMezzalaAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Organizador Itinerante (Apoyo)',
accessor: 'mediaOrganizadorItinerante',
Cell: ({ value }) => value || '-',
},
// MEDIAPUNTAS
{
Header: 'Mediapunta (Apoyo)',
accessor: 'mediaMediapuntaApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Mediapunta (Ataque)',
accessor: 'mediaMediapuntaAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Enganche (Ataque)',
accessor: 'mediaEnganche',
Cell: ({ value }) => value || '-',
},
{
Header: 'Trequartista (Ataque)',
accessor: 'mediaTrequartista',
Cell: ({ value }) => value || '-',
},
{
Header: 'Falso Nueve (Apoyo)',
accessor: 'mediaFalsoNueve',
Cell: ({ value }) => value || '-',
},
// EXTREMOS
{
Header: 'Extremo (Apoyo)',
accessor: 'mediaExtremoApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Extremo (Ataque)',
accessor: 'mediaExtremoAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Interior (Apoyo)',
accessor: 'mediaDelanteroInteriorApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Interior (Ataque)',
accessor: 'mediaDelanteroInteriorAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Extremo Invertido (Apoyo)',
accessor: 'mediaExtremoInvertidoApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Extremo Invertido (Ataque)',
accessor: 'mediaExtremoInvertidoAtaque',
Cell: ({ value }) => value || '-',
},
// DELANTEROS
{
Header: 'Delantero Avanzado (Ataque)',
accessor: 'mediaDelanteroAvanzado',
Cell: ({ value }) => value || '-',
},
{
Header: 'Hombre Objetivo (Apoyo)',
accessor: 'mediaHombreObjetivoApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Hombre Objetivo (Ataque)',
accessor: 'mediaHombreObjetivoAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Presionante (Defender)',
accessor: 'mediaDelanteroPresionanteDefender',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Presionante (Apoyo)',
accessor: 'mediaDelanteroPresionanteApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Presionante (Ataque)',
accessor: 'mediaDelanteroPresionanteAtaque',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Completo (Apoyo)',
accessor: 'mediaDelanteroCompletoApoyo',
Cell: ({ value }) => value || '-',
},
{
Header: 'Delantero Completo (Ataque)',
accessor: 'mediaDelanteroCompletoAtaque',
Cell: ({ value }) => value || '-',
},
], []);

const columnasMostrar = [
'Nombre',
'Media General',
'Pierna Izq.',
'Pierna Der.',
'Posición',
// PORTEROS
'Portero (Defensa)',
'Portero Cierre (Defensa)',
'Portero Cierre (Apoyo)',
'Portero Cierre (Ataque)',
// DEFENSAS CENTRALES
'Defensa Central (Defender, Taponar)',
'Defensa Central (Cubrir)',
'Defensa con Toque (Defender, Taponar)',
'Defensa con Toque (Cubrir)',
'Líbero (Apoyo)',
'Líbero (Ataque)',
// LATERALES
'Lateral (Defender)',
'Lateral (Apoyo)',
'Lateral (Ataque)',
'Carrilero (Apoyo)',
'Carrilero (Ataque)',
'Lateral Invertido (Defender)',
'Lateral Invertido (Apoyo)',
// MEDIOCENTROS DEFENSIVOS
'Pivote Defensivo (Defender)',
'Mediocentro Recuperador (Defender)',
'Mediocentro Recuperador (Apoyo)',
'Regista (Apoyo)',
'Organizador en Juego Profundo (Defender)',
'Organizador en Juego Profundo (Apoyo)',
// MEDIOCENTROS
'Centrocampista (Defender)',
'Centrocampista (Apoyo)',
'Centrocampista (Ataque)',
'Centrocampista Todoterreno (Apoyo)',
'Mezzala (Apoyo)',
'Mezzala (Ataque)',
'Organizador Itinerante (Apoyo)',
// MEDIAPUNTAS
'Mediapunta (Apoyo)',
'Mediapunta (Ataque)',
'Enganche (Ataque)',
'Trequartista (Ataque)',
'Falso Nueve (Apoyo)',
// EXTREMOS
'Extremo (Apoyo)',
'Extremo (Ataque)',
'Delantero Interior (Apoyo)',
'Delantero Interior (Ataque)',
'Extremo Invertido (Apoyo)',
'Extremo Invertido (Ataque)',
// DELANTEROS
'Delantero Avanzado (Ataque)',
'Hombre Objetivo (Apoyo)',
'Hombre Objetivo (Ataque)',
'Delantero Presionante (Defender)',
'Delantero Presionante (Apoyo)',
'Delantero Presionante (Ataque)',
'Delantero Completo (Apoyo)',
'Delantero Completo (Ataque)',
];

const data = useMemo(() => jugadores.map(jugador => ({
...jugador,
mediaGeneral: calcularMedia(jugador),
// PORTEROS
mediaPortero: calcularMedia(jugador, gruposAtributos["Portero (Defensa)"]),
mediaPorteroCierreDefensa: calcularMedia(jugador, gruposAtributos["Portero Cierre (Defensa)"]),
mediaPorteroCierreApoyo: calcularMedia(jugador, gruposAtributos["Portero Cierre (Apoyo)"]),
mediaPorteroCierreAtaque: calcularMedia(jugador, gruposAtributos["Portero Cierre (Ataque)"]),
// DEFENSAS CENTRALES
mediaDefensaCentralDefender: calcularMedia(jugador, gruposAtributos["Defensa Central (Defender, Taponar)"]),
mediaDefensaCentralCubrir: calcularMedia(jugador, gruposAtributos["Defensa Central (Cubrir)"]),
mediaDefensaConToqueDefender: calcularMedia(jugador, gruposAtributos["Defensa con Toque (Defender, Taponar)"]),
mediaDefensaConToqueCubrir: calcularMedia(jugador, gruposAtributos["Defensa con Toque (Cubrir)"]),
mediaLiberoApoyo: calcularMedia(jugador, gruposAtributos["Líbero (Apoyo)"]),
mediaLiberoAtaque: calcularMedia(jugador, gruposAtributos["Líbero (Ataque)"]),
// LATERALES
mediaLateralDefender: calcularMedia(jugador, gruposAtributos["Lateral (Defender)"]),
mediaLateralApoyo: calcularMedia(jugador, gruposAtributos["Lateral (Apoyo)"]),
mediaLateralAtaque: calcularMedia(jugador, gruposAtributos["Lateral (Ataque)"]),
mediaCarrileroApoyo: calcularMedia(jugador, gruposAtributos["Carrilero (Apoyo)"]),
mediaCarrileroAtaque: calcularMedia(jugador, gruposAtributos["Carrilero (Ataque)"]),
mediaLateralInvertidoDefender: calcularMedia(jugador, gruposAtributos["Lateral Invertido (Defender)"]),
mediaLateralInvertidoApoyo: calcularMedia(jugador, gruposAtributos["Lateral Invertido (Apoyo)"]),
// MEDIOCENTROS DEFENSIVOS
mediaPivoteDefensivo: calcularMedia(jugador, gruposAtributos["Pivote Defensivo (Defender)"]),
mediaMediocentroRecuperadorDefender: calcularMedia(jugador, gruposAtributos["Mediocentro Recuperador (Defender)"]),
mediaMediocentroRecuperadorApoyo: calcularMedia(jugador, gruposAtributos["Mediocentro Recuperador (Apoyo)"]),
mediaRegista: calcularMedia(jugador, gruposAtributos["Regista (Apoyo)"]),
mediaOrganizadorProfundoDefender: calcularMedia(jugador, gruposAtributos["Organizador en Juego Profundo (Defender)"]),
mediaOrganizadorProfundoApoyo: calcularMedia(jugador, gruposAtributos["Organizador en Juego Profundo (Apoyo)"]),
// MEDIOCENTROS
mediaCentrocampistaDefender: calcularMedia(jugador, gruposAtributos["Centrocampista (Defender)"]),
mediaCentrocampistaApoyo: calcularMedia(jugador, gruposAtributos["Centrocampista (Apoyo)"]),
mediaCentrocampistaAtaque: calcularMedia(jugador, gruposAtributos["Centrocampista (Ataque)"]),
mediaCentrocampistaTodoterreno: calcularMedia(jugador, gruposAtributos["Centrocampista Todoterreno (Apoyo)"]),
mediaMezzalaApoyo: calcularMedia(jugador, gruposAtributos["Mezzala (Apoyo)"]),
mediaMezzalaAtaque: calcularMedia(jugador, gruposAtributos["Mezzala (Ataque)"]),
mediaOrganizadorItinerante: calcularMedia(jugador, gruposAtributos["Organizador Itinerante (Apoyo)"]),
// MEDIAPUNTAS
mediaMediapuntaApoyo: calcularMedia(jugador, gruposAtributos["Mediapunta (Apoyo)"]),
mediaMediapuntaAtaque: calcularMedia(jugador, gruposAtributos["Mediapunta (Ataque)"]),
mediaEnganche: calcularMedia(jugador, gruposAtributos["Enganche (Ataque)"]),
mediaTrequartista: calcularMedia(jugador, gruposAtributos["Trequartista (Ataque)"]),
mediaFalsoNueve: calcularMedia(jugador, gruposAtributos["Falso Nueve (Apoyo)"]),
// EXTREMOS
mediaExtremoApoyo: calcularMedia(jugador, gruposAtributos["Extremo (Apoyo)"]),
mediaExtremoAtaque: calcularMedia(jugador, gruposAtributos["Extremo (Ataque)"]),
mediaDelanteroInteriorApoyo: calcularMedia(jugador, gruposAtributos["Delantero Interior (Apoyo)"]),
mediaDelanteroInteriorAtaque: calcularMedia(jugador, gruposAtributos["Delantero Interior (Ataque)"]),
mediaExtremoInvertidoApoyo: calcularMedia(jugador, gruposAtributos["Extremo Invertido (Apoyo)"]),
mediaExtremoInvertidoAtaque: calcularMedia(jugador, gruposAtributos["Extremo Invertido (Ataque)"]),
// DELANTEROS
mediaDelanteroAvanzado: calcularMedia(jugador, gruposAtributos["Delantero Avanzado (Ataque)"]),
mediaHombreObjetivoApoyo: calcularMedia(jugador, gruposAtributos["Hombre Objetivo (Apoyo)"]),
mediaHombreObjetivoAtaque: calcularMedia(jugador, gruposAtributos["Hombre Objetivo (Ataque)"]),
mediaDelanteroPresionanteDefender: calcularMedia(jugador, gruposAtributos["Delantero Presionante (Defender)"]),
mediaDelanteroPresionanteApoyo: calcularMedia(jugador, gruposAtributos["Delantero Presionante (Apoyo)"]),
mediaDelanteroPresionanteAtaque: calcularMedia(jugador, gruposAtributos["Delantero Presionante (Ataque)"]),
mediaDelanteroCompletoApoyo: calcularMedia(jugador, gruposAtributos["Delantero Completo (Apoyo)"]),
mediaDelanteroCompletoAtaque: calcularMedia(jugador, gruposAtributos["Delantero Completo (Ataque)"])
})), [jugadores]);
const {
getTableProps,
getTableBodyProps,
headerGroups,
rows,
prepareRow,
} = useTable(
{
columns,
data,
},
useSortBy
);

const handleFileUpload = (event) => {
const file = event.target.files[0];
if (!file) return;

setCargando(true);
const reader = new FileReader();
reader.onload = (e) => {
const content = e.target.result;
setTimeout(() => {
procesarHTML(content);
setCargando(false);
setArchivoCargado(true);
}, 500);
};
reader.onerror = () => {
setCargando(false);
alert('Error al leer el archivo');
};
reader.readAsText(file);
};

const procesarHTML = (html) => {
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const tabla = doc.querySelector('table');
if (!tabla) {
alert('No se encontró ninguna tabla en el archivo HTML');
return;
}

const headers = Array.from(tabla.querySelectorAll('th')).map(th => th.textContent.trim());
const filas = tabla.querySelectorAll('tbody tr');
const nuevosJugadores = Array.from(filas)
.map(fila => {
const celdas = fila.querySelectorAll('td');
const jugador = {};
headers.forEach((header, index) => {
jugador[header] = celdas[index]?.textContent.trim() || '';
});
return jugador;
})
// Filtrar jugadores que no tienen nombre o están vacíos
.filter(jugador => {
const tieneNombre = jugador.Nombre && jugador.Nombre.trim() !== '';
const tieneDatos = Object.values(jugador).some(valor =>
valor && valor.toString().trim() !== ''
);
return tieneNombre && tieneDatos;
});

setJugadores(nuevosJugadores);
};
if (jugadorSeleccionado) {
return (
<div className="jugador-detalle-container">
<div className="jugador-header">
<button onClick={volverATabla} className="back-button">
&larr; Volver a la lista
</button>
<h1>{jugadorSeleccionado.Nombre || 'Jugador'}</h1>
<div className="jugador-meta">
<span className="posicion-badge">{jugadorSeleccionado.Posición || 'Sin posición'}</span>
<span className="pierna-info">
{jugadorSeleccionado['Pierna izquierda'] || '-'} / {jugadorSeleccionado['Pierna derecha'] || '-'}
</span>
</div>
</div>

<div className="jugador-stats-container">
<div className="stats-card overall-stats">
<h2>Estadísticas Globales</h2>
<div className="stats-grid">
<div className="stat-item">
<div className="stat-value">{calcularMedia(jugadorSeleccionado)}</div>
<div className="stat-label">Media General</div>
</div>
</div>
</div>

<div className="stats-columns-container">
<div className="stats-column">
<div className="stats-card">
<h3>Atributos Técnicos</h3>
<div className="attributes-grid">
{Object.entries(mapeoAtributos)
.filter(([abrev]) => jugadorSeleccionado[abrev])
.map(([abrev, nombre]) => (
<div key={abrev} className="attribute-item">
<div className="attribute-name">{nombre}</div>
<div className="attribute-value">
<div
className="attribute-bar"
style={{ width: `${jugadorSeleccionado[abrev].toString().replace('%', '')}%` }}
></div>
<span>{jugadorSeleccionado[abrev]}</span>
</div>
</div>
))}
</div>
</div>
</div>

<div className="stats-column">
<div className="stats-card">
<h3>Atributos Físicos</h3>
<div className="attributes-grid">
{['Vel', 'Res', 'Fue', 'Agi', 'Ace', 'Sal', 'Equ']
.filter(abrev => jugadorSeleccionado[abrev])
.map(abrev => (
<div key={abrev} className="attribute-item">
<div className="attribute-name">{mapeoAtributos[abrev] || abrev}</div>
<div className="attribute-value">
<div
className="attribute-bar"
style={{ width: `${jugadorSeleccionado[abrev].toString().replace('%', '')}%` }}
></div>
<span>{jugadorSeleccionado[abrev]}</span>
</div>
</div>
))}
</div>
</div>

<div className="stats-card">
<h3>Atributos Mentales</h3>
<div className="attributes-grid">
{['Ant', 'Dec', 'Det', 'Val', 'Cnc', 'Vis', 'Lid']
.filter(abrev => jugadorSeleccionado[abrev])
.map(abrev => (
<div key={abrev} className="attribute-item">
<div className="attribute-name">{mapeoAtributos[abrev] || abrev}</div>
<div className="attribute-value">
<div
className="attribute-bar"
style={{ width: `${jugadorSeleccionado[abrev].toString().replace('%', '')}%` }}
></div>
<span>{jugadorSeleccionado[abrev]}</span>
</div>
</div>
))}
</div>
</div>
</div>
</div>
</div>
</div>
);
}

return (
<div className="App">
{cargando ? (
<div className="loader-container">
<div className="loader"></div>
<p>Procesando datos...</p>
</div>
) : archivoCargado ? (
<Container>
<h2 style={{ marginBottom: '20px', color: '#343a40' }}>Datos de Jugadores</h2>
<div style={{ overflowX: 'auto' }}>
<StyledTable {...getTableProps()}>
<TableHeader>
{headerGroups.map(headerGroup => (
<tr {...headerGroup.getHeaderGroupProps()}>
{headerGroup.headers.map(column => (
<TableHeaderCell
{...column.getHeaderProps(column.getSortByToggleProps())}
>
{column.render('Header')}
</TableHeaderCell>
))}
</tr>
))}
</TableHeader>
<tbody {...getTableBodyProps()}>
{rows.map(row => {
prepareRow(row);
return (
<TableRow {...row.getRowProps()}>
{row.cells.map(cell => (
<TableCell {...cell.getCellProps()}>
{cell.render('Cell')}
</TableCell>
))}
</TableRow>
);
})}
</tbody>
</StyledTable>
</div>
</Container>
) : (
<header className="App-header">
<h1>Sistema de Carga de Jugadores</h1>
<div className="upload-section">
<label htmlFor="file-upload" className="upload-button">
Subir Archivo HTML con Tabla de Jugadores
</label>
<input
id="file-upload"
type="file"
accept=".html,.htm"
onChange={handleFileUpload}
style={{ display: 'none' }}
/>
<p>El archivo debe contener columnas con los atributos técnicos, físicos y mentales</p>
</div>
</header>
)}
</div>
);
}

export default App;