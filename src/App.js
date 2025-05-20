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
  
  // Grupos de atributos para medias específicas
  const gruposAtributos = {
    "Portero (Defensa)": ["Aér", "Mdo", "Com", "Blo", "Pue", "Ref", "Saq", "1v1", "Ant", "Dec", "Col", "Cnc", "Agi"],
    "Portero Cierre (Defensa, Apoyo)": ["Aér","Mdo", "Com", "Blo", "Pue", "Ref","Sal","Saq","1v1","Pas","Ctr","Ant","Vis","Dec", "Col","Ser","Cnc","Ace","Agi"],
    "Portero Cierre (Ataque)": ["Aér", "Mdo", "Com","Exc","Blo", "Pue", "Ref","Sal","Saq","1v1","Pas","Ctr", "Ant","Vis","Dec", "Col","Ser","Cnc","Ace","Agi"],
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
    {
      Header: 'Portero (Defensa)',
      accessor: 'mediaPortero',
      Cell: ({ value }) => value || '-',
    },
    {
      Header: 'Portero Cierre (Defensa, Apoyo)',
      accessor: 'mediaPorteroCierre',
      Cell: ({ value }) => value || '-',
    },
    {
      Header: 'Portero Cierre (Ataque)',
      accessor: 'mediaPorteroCierreAtaque',
      Cell: ({ value }) => value || '-',
    },
  ], []);

    const columnasMostrar = [
    'Nombre', 
    'Media General',
    'Pierna izquierda', 
    'Pierna derecha', 
    'Posición',
    'Portero (Defensa)',
    'Portero Cierre (Defensa, Apoyo)',
    'Portero Cierre (Ataque)',
  ];

  const data = useMemo(() => jugadores.map(jugador => ({
    ...jugador,
    mediaGeneral: calcularMedia(jugador),
    mediaPortero: calcularMedia(jugador, gruposAtributos["Portero (Defensa)"]),
    mediaPorteroCierre: calcularMedia(jugador, gruposAtributos["Portero Cierre (Defensa, Apoyo)"]),
    mediaPorteroCierreAtaque: calcularMedia(jugador, gruposAtributos["Portero Cierre (Ataque)"])
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