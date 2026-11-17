import React, { useState, useEffect, useCallback } from 'react';
import { X, Wrench, MessageSquare, Clock, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { solicitudesApi, conversacionesApi } from '../services/api';
import { SolicitudTecnica, Conversacion } from '../types';
import { ChatModal } from './ChatModal';
import BaseModal from './BaseModal';

interface ClientSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  initialTab?: 'solicitudes' | 'mensajes';
}

export const ClientSupportModal: React.FC<ClientSupportModalProps> = ({
  isOpen,
  onClose,
  clienteId,
  initialTab = 'solicitudes',
}) => {
  const [tab, setTab] = useState<'solicitudes' | 'mensajes'>(initialTab);
  const [solicitudes, setSolicitudes] = useState<SolicitudTecnica[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sub-modal de chat contextual (z-[70] por encima de z-[60])
  const [chatConfig, setChatConfig] = useState<{
    isOpen: boolean;
    conversacionId?: number;
    tipoOrigen?: 'PEDIDO' | 'SOLICITUD_TECNICA';
    entidadId?: number;
  }>({ isOpen: false });

  const cargarDatos = useCallback(async () => {
    if (!clienteId) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'solicitudes') {
        const data = await solicitudesApi.listarPorCliente(clienteId);
        setSolicitudes(data);
      } else {
        const data = await conversacionesApi.listar();
        setConversaciones(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.mensaje || err?.message || 'Error al cargar información');
    } finally {
      setLoading(false);
    }
  }, [clienteId, tab]);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, tab, cargarDatos]);

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass="z-[60]"
        maxWidth="max-w-3xl"
        maxHeight="h-[92dvh] sm:h-[680px] max-h-[calc(100dvh-1.5rem)]"
        closeOnOverlayClick={false}
        ariaLabel="Centro de Atención y Soporte"
      >
        {/* ========================================================= */}
        {/* 1. ENCABEZADO FIJO (flex-shrink-0)                         */}
        {/* ========================================================= */}
        <header className="flex-shrink-0 p-4 sm:p-5 bg-[#1e293b]/90 border-b border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#22D3EE] flex-shrink-0">
              {tab === 'solicitudes' ? <Wrench className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-poppins font-bold text-white text-base sm:text-lg truncate">
                Centro de Atención y Soporte
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Seguimiento oficial de tus solicitudes técnicas y mensajes de soporte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={cargarDatos}
              className="p-2 text-slate-400 hover:text-[#22D3EE] rounded-lg hover:bg-[#334155]/40 transition-colors"
              title="Actualizar información"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#334155]/40 transition-colors"
              title="Cerrar ventana (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. PESTAÑAS FIJAS (flex-shrink-0)                          */}
        {/* ========================================================= */}
        <nav className="flex-shrink-0 flex border-b border-[#334155] bg-[#0B0F1A]/70 px-4 sm:px-5 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('solicitudes')}
            className={`pb-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              tab === 'solicitudes'
                ? 'border-[#22D3EE] text-[#22D3EE]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Mis Solicitudes Técnicas ({solicitudes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('mensajes')}
            className={`pb-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              tab === 'mensajes'
                ? 'border-[#22D3EE] text-[#22D3EE]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mis Mensajes & Chats ({conversaciones.length})</span>
          </button>
        </nav>

        {/* Error (si existe) */}
        {error && (
          <div className="flex-shrink-0 p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CONTENIDO DESPLAZABLE (flex-1 min-h-0 overflow-y-auto) */}
        {/* ========================================================= */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0B0F1A]/85 overscroll-contain">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#7C3AED]" />
              <p>Consultando información en el servidor...</p>
            </div>
          )}

          {!loading && tab === 'solicitudes' && (
            solicitudes.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Wrench className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No tienes solicitudes técnicas activas</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cuando diligencies el Asistente Técnico en la página de inicio, tus radicados aparecerán aquí con seguimiento en tiempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {solicitudes.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-[#1e293b]/70 border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#7C3AED]/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-poppins font-bold text-white text-sm">
                          {s.numeroSolicitud || s.numeroTicket}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.estado === 'RECIBIDA'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : s.estado === 'EN_REVISION'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : s.estado === 'EN_PROCESO'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : s.estado === 'RESUELTA'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {s.estado}
                        </span>
                      </div>
                      <p className="text-xs text-[#22D3EE] font-medium capitalize truncate">
                        {(s.servicioTipo || s.tipoServicio || '').replace('-', ' ')} • {s.marcaModelo} ({s.dispositivoTipo || s.tipoDispositivo})
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2 break-words">
                        {s.sintomas || s.descripcionFalla}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Radicado el {new Date(s.fechaCreacion).toLocaleDateString('es-CO')}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setChatConfig({
                            isOpen: true,
                            tipoOrigen: 'SOLICITUD_TECNICA',
                            entidadId: s.id,
                          })
                        }
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 transition-all shrink-0 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#22D3EE]" />
                        <span>Chat de Soporte</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {!loading && tab === 'mensajes' && (
            conversaciones.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No tienes conversaciones iniciadas</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Puedes iniciar un chat contextual directamente desde el detalle de cualquiera de tus compras o solicitudes técnicas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversaciones.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 rounded-2xl bg-[#1e293b]/70 border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#7C3AED]/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-poppins font-semibold text-white text-sm truncate">
                          {conv.tituloContexto}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            conv.estado === 'ABIERTA'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {conv.estado}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-bold">
                            {conv.unreadCount} nuevo(s)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {conv.tipoOrigen === 'PEDIDO' ? (
                          <ShoppingCart className="w-3.5 h-3.5 text-[#22D3EE] flex-shrink-0" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5 text-[#22D3EE] flex-shrink-0" />
                        )}
                        <span>
                          {conv.tipoOrigen === 'PEDIDO' ? 'Pedido #' : 'Solicitud Técnica #'}{conv.entidadId}
                        </span>
                        <span>•</span>
                        <span className="truncate">
                          {conv.fechaUltimaActividad || conv.fechaCreacion
                            ? new Date(conv.fechaUltimaActividad || conv.fechaCreacion).toLocaleString('es-CO')
                            : 'Sin mensajes'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setChatConfig({
                          isOpen: true,
                          conversacionId: conv.id,
                        })
                      }
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 transition-all shrink-0 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#22D3EE]" />
                      <span>Abrir Conversación</span>
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </BaseModal>

      {/* Sub-modal de chat contextual (Z-Index superior para superposición limpia) */}
      <ChatModal
        isOpen={chatConfig.isOpen}
        onClose={() => {
          setChatConfig({ isOpen: false });
          cargarDatos();
        }}
        conversacionId={chatConfig.conversacionId}
        tipoOrigen={chatConfig.tipoOrigen}
        entidadId={chatConfig.entidadId}
        isAdmin={false}
        zIndexClass="z-[70]"
      />
    </>
  );
};

export default ClientSupportModal;
