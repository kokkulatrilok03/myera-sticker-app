import React, { useState, useEffect, useReducer, useCallback } from 'react';
import Canvas from './components/Canvas';
import StickerButton from './components/StickerButton';

const stickerReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_STICKER':
      return [...state, action.payload];
    case 'SET_STICKERS':
      return action.payload;
    default:
      return state;
  }
};

const App = () => {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [stickers, dispatch] = useReducer(stickerReducer, [], () => {
    const saved = localStorage.getItem('stickers');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const handleAction = (newState) => {
    setHistory((prev) => [...prev, stickers]);
    dispatch({ type: 'SET_STICKERS', payload: newState });
    setFuture([]);
  };

  const undo = useCallback(() => {
    if (history.length) {
      const previous = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setFuture((f) => [stickers, ...f]);
      dispatch({ type: 'SET_STICKERS', payload: previous });
    }
  }, [history, stickers]);

  const redo = useCallback(() => {
    if (future.length) {
      const next = future[0];
      setFuture((f) => f.slice(1));
      setHistory((prev) => [...prev, stickers]);
      dispatch({ type: 'SET_STICKERS', payload: next });
    }
  }, [future, stickers]);

  const clearAll = () => {
    if (stickers.length > 0 && window.confirm('Are you sure you want to clear all stickers?')) {
      handleAction([]);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const exportAsPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'sticker-canvas.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (newIsMobile !== isMobile) {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo]);

  useEffect(() => {
    localStorage.setItem('stickers', JSON.stringify(stickers));
  }, [stickers]);

  const stickerUrls = [
    {
      url: 'https://img.icons8.com/3d-fluency/94/unicorn.png',
      name: 'Unicorn',
      category: 'Animals'
    },
    {
      url: 'https://img.icons8.com/3d-fluency/94/cupcake.png',
      name: 'Cupcake',
      category: 'Food'
    },
    {
      url: 'https://img.icons8.com/3d-fluency/94/star.png',
      name: 'Star',
      category: 'Shapes'
    }
  ];

  const addSticker = async (src) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    handleAction([
      ...stickers,
      {
        src,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        id: Date.now()
      }
    ]);
    setLoading(false);
  };

  return (
    <div className={`app-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile && (
        <div className="mobile-header">
          <button className={`menu-toggle ${sidebarCollapsed ? '' : 'open'}`} onClick={toggleSidebar}>
            <span></span><span></span><span></span>
          </button>
          <h1>Sticker Canvas</h1>
          <button className="export-btn mobile-export" onClick={exportAsPNG}>📁</button>
        </div>
      )}

      <div className={`sticker-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {!isMobile && (
          <div className="panel-header">
            <h2>{sidebarCollapsed ? 'S' : 'Stickers'}</h2>
            <button className="collapse-btn" onClick={toggleSidebar}>
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        )}

        <div className="stickers-grid">
          {stickerUrls.map((sticker, index) => (
            <div key={index} className="sticker-item">
              <StickerButton
                src={sticker.url}
                onAddSticker={addSticker}
                loading={loading}
                className="tooltip"
                data-tooltip={sticker.name}
              />
              {!sidebarCollapsed && <span className="sticker-label">{sticker.name}</span>}
            </div>
          ))}
        </div>

        <div className="controls-section">
          <label className="custom-checkbox">
            <input type="checkbox" checked={snapToGrid} onChange={() => setSnapToGrid(!snapToGrid)} />
            <span className="checkmark"></span>
            {!sidebarCollapsed && 'Snap to Grid'}
          </label>

          <div className="action-buttons">
            <button className="action-btn undo-btn" onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)">
              ↶ {!sidebarCollapsed && 'Undo'}
            </button>
            <button className="action-btn redo-btn" onClick={redo} disabled={!future.length} title="Redo (Ctrl+Y)">
              ↷ {!sidebarCollapsed && 'Redo'}
            </button>
            <button className="action-btn clear-btn" onClick={clearAll} disabled={!stickers.length} title="Clear All">
              🗑 {!sidebarCollapsed && 'Clear'}
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-label">Stickers:</span>
              <span className="stat-value">{stickers.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="canvas-container">
        {!isMobile && (
          <div className="desktop-controls">
            <button className="export-btn desktop-export" onClick={exportAsPNG}>
              📁 Export as PNG
            </button>
          </div>
        )}

        <Canvas stickers={stickers} handleAction={handleAction} snapToGrid={snapToGrid} />

        {isMobile && (
          <button className="fab" onClick={toggleSidebar} aria-label="Toggle sticker panel">
            +
          </button>
        )}
      </div>

      {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
      {isMobile && !sidebarCollapsed && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  );
};

export default App;
