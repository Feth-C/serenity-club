// frontend/src/components/layout/WindowControls/WindowControls.jsx

import React, { useState, useEffect } from 'react';
import './WindowControls.css';

const WindowControls = () => {
    const [isMaximized, setIsMaximized] = useState(false);
    const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    useEffect(() => {
        // Escuta o evento do Electron para saber se a janela maximizou/restaurou
        if (window.electronAPI?.onMaximizedState) {
            window.electronAPI.onMaximizedState((state) => setIsMaximized(state));
        }
    }, []);

    if (isMac) return null;

    return (
        <>
            {/* Barra invisível que permite arrastar a janela */}
            <div className="titlebar-drag-region" />

            <div className="window-controls">
                <button onClick={() => window.electronAPI.controlWindow('minimize')} className="control-btn">
                    <svg width="10" height="1" viewBox="0 0 10 1"><path d="M0 0h10v1H0z" fill="currentColor" /></svg>
                </button>

                <button onClick={() => window.electronAPI.controlWindow('maximize')} className="control-btn">
                    {isMaximized ? (
                        /* Ícone de Restaurar (dois quadradinhos) */
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 0v2H0v8h8V8h2V0H2zm5 9H1V3h6v6zm2-2H8V2H3V1h6v6z" fill="currentColor" /></svg>
                    ) : (
                        /* Ícone de Maximizar (um quadradinho) */
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" fill="currentColor" /></svg>
                    )}
                </button>

                <button onClick={() => window.electronAPI.controlWindow('close')} className="control-btn close-btn">
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1.2" /></svg>
                </button>
            </div>
        </>
    );
};

export default WindowControls;