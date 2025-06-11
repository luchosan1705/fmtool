import React, { useState, useMemo, useCallback } from 'react';

// --- DATA (Could be moved to a separate file) ---
const ATTRIBUTE_MAP = {
    "Cór": "Saques de esquina", "Reg": "Regate", "Rem": "Remate", "Ctr": "Control", "Lib": "Tiros Libres", "Cen": "Centros", "Cab": "Cabeceo", "Lej": "Tiros Lejanos", "Sq L": "Saques Largos", "Mar": "Marcaje", "Pas": "Pases", "Pen": "Penales", "Ent": "Entradas", "Téc": "Técnica", "Agr": "Agresividad", "Ant": "Anticipacion", "Val": "Valentia", "Ser": "Serenidad", "Cnc": "Concentracion", "Dec": "Decisiones", "Det": "Determinacion", "Tal": "Talento", "Lid": "Liderazgo", "Dmq": "Desmarques", "Col": "Colocacion", "JEq": "Juego en Equipo", "Vis": "Vision", "Sac": "Sacrificio", "Ace": "Aceleracion", "Agi": "Agilidad", "Equ": "Equilibro", "Sal": "Alcance de Salto", "Fís": "Recuperacion Fisica", "Vel": "Velocidad", "Res": "Resistencia", "Fue": "Fuerza", "Aér": "Alcance Aereo", "Mdo": "Mando en el area", "Com": "Comunicacion", "Exc": "Excentricidad", "Blo": "Blocaje", "Pue": "Saques de Puerta", "1v1": "Uno contra Uno", "Puñ": "Golpeo de Puños", "Ref": "Reflejos", "SAL": "Salida", "Saq": "Saque con la Mano"
};

const ATTRIBUTE_GROUPS = {
    "Técnicos": ["Cór", "Reg", "Rem", "Ctr", "Lib", "Cen", "Cab", "Lej", "Sq L", "Mar", "Pas", "Pen", "Ent", "Téc"],
    "Mentales": ["Agr", "Ant", "Val", "Ser", "Cnc", "Dec", "Det", "Tal", "Lid", "Dmq", "Col", "JEq", "Vis", "Sac"],
    "Físicos": ["Ace", "Agi", "Equ", "Sal", "Fís", "Vel", "Res", "Fue"],
    "Portero": ["Aér", "Mdo", "Com", "Exc", "Blo", "Pue", "1v1", "Puñ", "Ref", "SAL", "Saq"],
};

const ROLE_ATTRIBUTES = {
    "Portero (Defensa)": ["Mdo", "Com", "Blo", "Ref", "Saq", "1v1", "Ant", "Dec", "Col", "Cnc", "Agi", "Val"],
    "Portero Cierre (Ataque)": ["Sal", "Ref", "1v1", "Pas", "Ctr", "Ant", "Dec", "Vis", "Ser", "Cnc", "Ace", "Agi", "Vel", "Exc"],
    "Defensa Central (Defender)": ["Cab", "Mar", "Ent", "Fue", "Ant", "Dec", "Col", "Cnc", "Val", "Sal"],
    "Defensa con Toque (Cubrir)": ["Mar", "Ent", "Pas", "Téc", "Ant", "Dec", "Col", "Cnc", "Ser", "Vis", "Ace", "Vel"],
    "Lateral (Ataque)": ["Cen", "Reg", "Ent", "Téc", "Ant", "Dec", "Dmq", "Cnc", "Sac", "Res", "Ace", "Vel"],
    "Carrilero (Ataque)": ["Cen", "Reg", "Téc", "Ant", "Dec", "Dmq", "Tal", "Sac", "Res", "Ace", "Vel"],
    "Pivote Defensivo (Defender)": ["Mar", "Ent", "Ant", "Dec", "Col", "Cnc", "Fue", "Val", "Cab"],
    "Mediocentro Recuperador (Apoyo)": ["Ent", "Pas", "Sac", "Ant", "Agr", "Res", "Val"],
    "Organizador en Juego Profundo (Apoyo)": ["Pas", "Téc", "Ant", "Dec", "Vis", "Ser", "Dmq", "Tal"],
    "Centrocampista Todoterreno (Apoyo)": ["Ent", "Pas", "Rem", "Sac", "Res", "Dec", "Dmq", "Fue"],
    "Mezzala (Ataque)": ["Pas", "Rem", "Reg", "Téc", "Ant", "Dec", "Dmq", "Ace"],
    "Mediapunta (Ataque)": ["Pas", "Rem", "Téc", "Ant", "Dec", "Vis", "Dmq", "Ser"],
    "Enganche (Ataque)": ["Pas", "Reg", "Téc", "Vis", "Dec", "Dmq", "Ser", "Tal", "Agi"],
    "Extremo (Ataque)": ["Cen", "Reg", "Téc", "Ant", "Dmq", "Ace", "Vel", "Agi"],
    "Delantero Interior (Ataque)": ["Rem", "Reg", "Téc", "Ant", "Dmq", "Ace", "Vel", "Ser"],
    "Delantero Avanzado (Ataque)": ["Rem", "Ctr", "Ant", "Dmq", "Ser", "Ace", "Vel"],
    "Delantero Completo (Ataque)": ["Rem", "Cab", "Reg", "Téc", "Ant", "Dmq", "Ser", "Ace", "Vel", "Fue", "Sal"]
};

// --- CSS STYLES ---
const GlobalStyles = () => (
    <style>{`
        :root {
            --color-background: #f3f4f6;
            --color-text: #1f2937;
            --color-card-bg: #ffffff;
            --color-border: #e5e7eb;
            --color-primary: #3b82f6;
            --color-primary-text: #ffffff;
            --color-secondary-text: #6b7280;
            --color-header-bg: rgba(255, 255, 255, 0.8);
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }

        /* Basic Reset & Body Styles */
        body {
            margin: 0;
            font-family: var(--font-sans);
            background-color: var(--color-background);
            color: var(--color-text);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* App Container */
        .app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .main-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        /* Keyframes */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }

        /* Header */
        .app-header {
            padding: 1rem 1.5rem;
            background-color: var(--color-header-bg);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--color-border);
            position: sticky;
            top: 0;
            z-index: 30;
        }
        .header-content {
            max-width: 80rem;
            margin: auto;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .header-logo {
            font-size: 1.5rem;
        }
        .header-title {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--color-text);
            margin: 0;
        }

        /* Card Component */
        .card {
            background-color: var(--color-card-bg);
            border: 1px solid var(--color-border);
            border-radius: 0.75rem;
            box-shadow: var(--shadow-sm);
        }
        
        /* Loader */
        .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-grow: 1;
        }
        .loader-spinner {
            width: 4rem;
            height: 4rem;
            border: 4px solid var(--color-primary);
            border-style: dashed;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .loader-text {
            margin-top: 1rem;
            font-size: 1.125rem;
            color: var(--color-secondary-text);
        }

        /* File Upload */
        .file-upload-wrapper {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .file-upload-container {
            width: 100%;
            max-width: 32rem;
            text-align: center;
        }
        .file-upload-label {
            padding: 3rem;
            border: 2px dashed #d1d5db;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .file-upload-label.dragging, .file-upload-label:hover {
            border-color: var(--color-primary);
            background-color: #eff6ff;
        }
        .file-upload-label svg {
            width: 2rem;
            height: 2rem;
            color: #6b7280;
        }
        .file-upload-text {
            margin-top: 1rem;
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--color-text);
        }
        .file-upload-subtext {
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: var(--color-secondary-text);
        }
        .file-upload-input {
            display: none;
        }
        .file-upload-info {
            margin-top: 1.5rem;
            font-size: 0.75rem;
            color: var(--color-secondary-text);
            max-width: 24rem;
            margin-left: auto;
            margin-right: auto;
        }
        
        /* Player Table */
        .player-table-container {
            max-width: 80rem;
            margin: auto;
            padding: 1rem;
        }
        .table-wrapper {
            overflow-x: auto;
        }
        .player-table {
            width: 100%;
            font-size: 0.875rem;
            text-align: left;
            color: var(--color-secondary-text);
            border-collapse: collapse;
        }
        .player-table thead {
            font-size: 0.75rem;
            text-transform: uppercase;
            background-color: #f9fafb;
            color: #374151;
        }
        .player-table th {
            padding: 0.75rem 1.5rem;
        }
        .player-table th button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: inherit;
            font-family: inherit;
            color: inherit;
            padding: 0;
        }
        .player-table th button:hover {
            color: var(--color-text);
        }
        .player-table tbody tr {
            background-color: var(--color-card-bg);
            border-bottom: 1px solid var(--color-border);
            transition: background-color 0.2s;
        }
        .player-table tbody tr:hover {
            background-color: #f9fafb;
        }
        .player-table td {
            padding: 1rem 1.5rem;
            vertical-align: middle;
        }
        .player-name-button {
            font-weight: 500;
            color: var(--color-text);
            text-decoration: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
        }
        .player-name-button:hover {
            text-decoration: underline;
        }
        .player-media {
            font-weight: bold;
            font-size: 1.125rem;
            color: var(--color-primary);
        }
        .top-roles-container {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .role-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .role-score-badge {
            padding: 2px 8px;
            font-size: 0.75rem;
            font-weight: 600;
            color: #065f46;
            background-color: #d1fae5;
            border-radius: 9999px;
        }

        /* Player Detail */
        .player-detail-container {
            max-width: 80rem;
            margin: auto;
            padding: 1.5rem 1rem;
        }
        .back-button {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 0.5rem 1rem;
            background-color: #e5e7eb;
            color: var(--color-text);
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .back-button:hover {
            background-color: #d1d5db;
        }
        .back-button svg {
            width: 1.25rem;
            height: 1.25rem;
            margin-right: 0.5rem;
        }

        .player-header-card {
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .player-header-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        @media (min-width: 640px) {
            .player-header-content {
                flex-direction: row;
                align-items: center;
            }
        }
        .player-avatar {
            width: 4rem;
            height: 4rem;
            border-radius: 50%;
            background: linear-gradient(to bottom right, #60a5fa, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
            flex-shrink: 0;
        }
        .player-info {
            flex-grow: 1;
        }
        .player-name {
            font-size: 2.25rem;
            line-height: 2.5rem;
            font-weight: bold;
            color: var(--color-text);
            margin: 0;
        }
        .player-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 0.25rem;
            color: var(--color-secondary-text);
        }
        .position-badge {
            padding: 0.25rem 0.75rem;
            background-color: #dbeafe;
            color: #1e40af;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 9999px;
        }
        .player-main-stats {
            text-align: center;
        }
        @media (min-width: 640px) {
            .player-main-stats {
                margin-left: auto;
            }
        }
        .main-stat-value {
            font-size: 3rem;
            font-weight: bold;
            color: var(--color-primary);
        }
        .main-stat-label {
            font-size: 0.875rem;
            color: var(--color-secondary-text);
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        @media (min-width: 1024px) {
            .detail-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        .attributes-column {
            grid-column: span 1 / span 1;
        }
        @media (min-width: 1024px) {
            .attributes-column {
                grid-column: span 2 / span 2;
            }
        }
        .attributes-column .card:not(:last-child) {
            margin-bottom: 1.5rem;
        }
        .roles-column {
            grid-column: span 1 / span 1;
        }

        .card-header {
            padding: 1rem;
            border-bottom: 1px solid var(--color-border);
        }
        .card-title {
            font-weight: bold;
            font-size: 1.125rem;
            color: var(--color-text);
            margin: 0;
        }
        .attributes-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem 1.5rem;
            padding: 1rem;
        }
        @media (min-width: 768px) {
            .attributes-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        .attribute-item .name-value-pair {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
        }
        .attribute-item .name {
            color: var(--color-secondary-text);
        }
        .attribute-item .value {
            font-weight: 600;
            color: var(--color-text);
        }
        .attribute-bar-container {
            width: 100%;
            background-color: #e5e7eb;
            border-radius: 9999px;
            height: 0.625rem;
        }
        .attribute-bar {
            height: 100%;
            border-radius: 9999px;
            transition: width 0.5s ease-in-out;
        }
        .attr-color-green { background-color: #22c55e; }
        .attr-color-yellow { background-color: #f59e0b; }
        .attr-color-red { background-color: #ef4444; }

        .roles-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .role-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--color-border);
        }
        .role-list-item:last-child {
            border-bottom: none;
        }
        .role-list-item .name {
            font-size: 0.875rem;
            color: var(--color-text);
        }
        .role-list-item .score {
            font-weight: bold;
            font-size: 1.125rem;
            color: var(--color-primary);
        }

    `}</style>
);


// --- UTILITY FUNCTIONS ---
const calculateAverage = (player, attributes = null) => {
    const attributeKeys = attributes || Object.keys(ATTRIBUTE_MAP);
    const numericValues = attributeKeys
        .map(attr => player[attr])
        .filter(val => val !== undefined)
        .map(val => parseFloat(String(val).replace('%', '')))
        .filter(num => !isNaN(num));

    if (numericValues.length === 0) return 0;
    const sum = numericValues.reduce((a, b) => a + b, 0);
    return (sum * 5 / numericValues.length);
};

// --- SVG ICONS ---
const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

// --- UI COMPONENTS ---
const Card = ({ children, className = '' }) => (
    <div className={`card ${className}`}>
        {children}
    </div>
);

const AttributeBar = ({ value, colorClass }) => (
    <div className="attribute-bar-container">
        <div className={`attribute-bar ${colorClass}`} style={{ width: `${value}%` }}></div>
    </div>
);

const Loader = ({ text = 'Procesando datos...' }) => (
    <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">{text}</p>
    </div>
);

const Header = () => (
    <header className="app-header">
        <div className="header-content">
            <span className="header-logo">⚽</span>
            <h1 className="header-title">Analizador de Jugadores FM</h1>
        </div>
    </header>
);

// --- MAIN COMPONENTS ---

const FileUpload = ({ onFileUpload, setLoading }) => {
    const [dragging, setDragging] = useState(false);

    const handleFileChange = (files) => {
        if (files && files[0]) {
            setLoading(true);
            onFileUpload(files[0]);
        }
    };

    const handleDragEvents = (e, isDragging) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(isDragging);
    };

    return (
        <div className="file-upload-wrapper">
            <div className="w-full max-w-lg text-center">
                <label
                    htmlFor="file-upload"
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={(e) => {
                        handleDragEvents(e, false);
                        handleFileChange(e.dataTransfer.files);
                    }}
                    className={`file-upload-label ${dragging ? 'dragging' : ''}`}
                >
                    <FileUploadIcon />
                    <p className="file-upload-text">Arrastra y suelta tu archivo HTML aquí</p>
                    <p className="file-upload-subtext">o haz clic para seleccionar</p>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".html,.htm"
                        className="file-upload-input"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                </label>
                <p className="file-upload-info">
                    Asegúrate de que el archivo HTML exportado desde Football Manager contenga la tabla de atributos de los jugadores.
                </p>
            </div>
        </div>
    );
};

const PlayerDetail = ({ player, onBack }) => {

    const getAttributeColorClass = (value) => {
        if (value >= 80) return 'attr-color-green';
        if (value >= 65) return 'attr-color-yellow';
        return 'attr-color-red';
    };

    const allRoleScores = useMemo(() => {
        return Object.entries(ROLE_ATTRIBUTES)
            .map(([role, attrs]) => ({
                role,
                score: calculateAverage(player, attrs)
            }))
            .sort((a, b) => b.score - a.score);
    }, [player]);

    return (
        <div className="player-detail-container animate-fade-in">
            <button onClick={onBack} className="back-button">
                <BackIcon />
                Volver a la lista
            </button>
            <Card className="player-header-card">
                <div className="player-header-content">
                    <div className="player-avatar">{player.Nombre.charAt(0)}</div>
                    <div className="player-info">
                        <h2 className="player-name">{player.Nombre}</h2>
                        <div className="player-meta">
                            <span className="position-badge">{player['Posición'] || 'N/A'}</span>
                            <span>Piernas: {player['Pierna izquierda']} / {player['Pierna derecha']}</span>
                        </div>
                    </div>
                    <div className="player-main-stats">
                         <div className="main-stat-value">{player.mediaGeneral.toFixed(1)}</div>
                         <div className="main-stat-label">Media General</div>
                    </div>
                </div>
            </Card>

            <div className="detail-grid">
                <div className="attributes-column">
                    {Object.entries(ATTRIBUTE_GROUPS).map(([groupName, attrs]) => (
                        <Card key={groupName}>
                           <div className="card-header">
                             <h3 className="card-title">{groupName}</h3>
                           </div>
                           <div className="attributes-grid">
                                {attrs
                                    .filter(attr => player[attr] !== undefined)
                                    .map(attr => {
                                        const value = parseFloat(String(player[attr]).replace('%', ''));
                                        return (
                                            <div key={attr} className="attribute-item">
                                                <div className="name-value-pair">
                                                    <span className="name">{ATTRIBUTE_MAP[attr]}</span>
                                                    <span className="value">{value}</span>
                                                </div>
                                                <AttributeBar value={value} colorClass={getAttributeColorClass(value)} />
                                            </div>
                                        );
                                })}
                           </div>
                        </Card>
                    ))}
                </div>

                <div className="roles-column">
                    <Card>
                        <div className="card-header">
                          <h3 className="card-title">Mejores Roles</h3>
                        </div>
                        <ul className="roles-list">
                            {allRoleScores.map(({ role, score }) => (
                                <li key={role} className="role-list-item">
                                    <span className="name">{role}</span>
                                    <span className="score">{score.toFixed(1)}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const PlayerTable = ({ players, onPlayerSelect }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'mediaGeneral', direction: 'desc' });

    const sortedPlayers = useMemo(() => {
        let sortableItems = [...players];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [players, sortConfig]);
    
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };
    
    const columns = [
        { key: 'Nombre', label: 'Nombre' },
        { key: 'mediaGeneral', label: 'Media' },
        { key: 'Posición', label: 'Posición' },
        { key: 'topRoles', label: 'Mejores Roles' },
    ];

    return (
        <div className="player-table-container animate-fade-in">
            <Card>
                <div className="table-wrapper">
                    <table className="player-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key}>
                                        <button onClick={() => col.key !== 'topRoles' && requestSort(col.key)}>
                                            {col.label}
                                            {col.key !== 'topRoles' && <span>{getSortIndicator(col.key)}</span>}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayers.map((player) => (
                                <tr key={player.Nombre}>
                                    <td>
                                        <button onClick={() => onPlayerSelect(player)} className="player-name-button">
                                            {player.Nombre}
                                        </button>
                                    </td>
                                    <td><span className="player-media">{player.mediaGeneral.toFixed(1)}</span></td>
                                    <td>{player['Posición']}</td>
                                    <td>
                                        <div className="top-roles-container">
                                            {player.topRoles.map(role => (
                                                <div key={role.role} className="role-item">
                                                    <span className="role-score-badge">{role.score.toFixed(1)}</span>
                                                    <span>{role.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};


function App() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const processHtmlFile = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const html = e.target.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const table = doc.querySelector('table');
            if (!table) {
                alert('No se encontró ninguna tabla en el archivo HTML.');
                setLoading(false);
                return;
            }

            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
            const rows = table.querySelectorAll('tbody tr');
            const newPlayers = Array.from(rows)
                .map(row => {
                    const cells = row.querySelectorAll('td');
                    const player = {};
                    headers.forEach((header, index) => {
                        player[header] = cells[index]?.textContent.trim() || '';
                    });
                    return player;
                })
                .filter(player => player.Nombre && player.Nombre.trim() !== '');

            const playersWithAverages = newPlayers.map(player => {
                const allRoleScores = Object.entries(ROLE_ATTRIBUTES)
                    .map(([role, attrs]) => ({
                        role,
                        score: calculateAverage(player, attrs)
                    }))
                    .sort((a, b) => b.score - a.score);

                return {
                    ...player,
                    mediaGeneral: calculateAverage(player),
                    topRoles: allRoleScores.slice(0, 3)
                };
            });
            
            setPlayers(playersWithAverages);
            setLoading(false);
        };
        reader.onerror = () => {
            alert('Error al leer el archivo.');
            setLoading(false);
        };
        reader.readAsText(file);
    }, []);
    
    return (
        <>
            <GlobalStyles />
            <div className="app-container">
                <Header />
                <main className="main-content">
                    {loading ? (
                        <Loader />
                    ) : selectedPlayer ? (
                        <PlayerDetail player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
                    ) : players.length > 0 ? (
                        <PlayerTable players={players} onPlayerSelect={setSelectedPlayer} />
                    ) : (
                        <FileUpload onFileUpload={processHtmlFile} setLoading={setLoading} />
                    )}
                </main>
            </div>
        </>
    );
}

export default App;