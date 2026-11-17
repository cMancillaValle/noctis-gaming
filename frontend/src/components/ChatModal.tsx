import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Lock, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { conversacionesApi } from '../services/api';
import { Conversacion, Mensaje } from '../types';
import CustomInput from './form/CustomInput';
import BaseModal from './BaseModal';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversacionId?: number;
  tipoOrigen?: 'PEDIDO' | 'SOLICITUD_TECNICA';
  entidadId?: number;
  isAdmin?: boolean;
  zIndexClass?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversacionId: initialConversacionId,
  tipoOrigen,
  entidadId,
  isAdmin = false,
  zIndexClass = 'z-[70]',
}) => {
  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para control preciso de scroll interno sin afectar ancestros
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const prevMessagesCountRef = useRef(0);

  // Desplazamiento seguro dentro del contenedor específico sin tocar window o document
  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Verificar si el usuario está cerca del fondo (para no interrumpir lectura de mensajes antiguos)
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 80;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  }, []);

  const cargarDatos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      setError(null);

      let conv: Conversacion;

      if (initialConversacionId) {
        conv = await conversacionesApi.obtenerPorId(initialConversacionId);
      } else if (tipoOrigen && entidadId) {
        conv = await conversacionesApi.obtenerOCrearPorContexto(tipoOrigen, entidadId);
      } else {
        setError('No se proporcionó contexto para la conversación');
        setCargando(false);
        return;
      }

      setConversacion(conv);
      const msgs = await conversacionesApi.listarMensajes(conv.id);

      // Si hay mensajes nuevos, determinar si desplazamos o no
      setMensajes(msgs);

      // Marcar como leídos en backend
      try {
        await conversacionesApi.marcarComoLeidos(conv.id);
      } catch {
        // Silencioso
      }
    } catch (err: any) {
      console.error('Error al cargar conversación:', err);
      setError(err?.response?.data?.mensaje || err?.message || 'Error al conectar con la conversación');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [initialConversacionId, tipoOrigen, entidadId]);

  // Ciclo de vida y polling
  useEffect(() => {
    if (isOpen) {
      isFirstLoadRef.current = true;
      cargarDatos(false);
      const interval = setInterval(() => {
        cargarDatos(true);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setConversacion(null);
      setMensajes([]);
      setNuevoMensaje('');
      setError(null);
      prevMessagesCountRef.current = 0;
    }
  }, [isOpen, cargarDatos]);

  // Manejador inteligente de auto-scroll
  useEffect(() => {
    if (mensajes.length === 0) return;

    if (isFirstLoadRef.current) {
      // Primera carga: scroll inmediato al final
      scrollToBottom(false);
      isFirstLoadRef.current = false;
    } else if (mensajes.length > prevMessagesCountRef.current) {
      // Llegó un mensaje nuevo: si estaba al fondo, hacer scroll suave
      if (isNearBottom()) {
        scrollToBottom(true);
      }
    }
    prevMessagesCountRef.current = mensajes.length;
  }, [mensajes, isNearBottom, scrollToBottom]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacion || enviando) return;

    if (conversacion.estado === 'CERRADA') {
      setError('Esta conversación se encuentra cerrada y no admite nuevos mensajes');
      return;
    }

    try {
      setEnviando(true);
      setError(null);
      const msgCreado = await conversacionesApi.enviarMensaje(conversacion.id, nuevoMensaje.trim());
      setMensajes((prev) => [...prev, msgCreado]);
      setNuevoMensaje('');
      // Forzar scroll suave cuando el propio usuario envía
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      setError(err?.response?.data?.mensaje || err?.message || 'No fue posible enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const handleCerrarConversacion = async () => {
    if (!conversacion || !isAdmin) return;
    if (!window.confirm('¿Seguro que deseas cerrar esta conversación? Ninguna de las partes podrá enviar más mensajes.')) return;

    try {
      setCargando(true);
      const convActualizada = await conversacionesApi.cerrarConversacion(conversacion.id);
      setConversacion(convActualizada);
    } catch (err: any) {
      setError(err?.response?.data?.mensaje || 'Error al cerrar la conversación');
    } finally {
      setCargando(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      maxWidth="max-w-2xl"
      maxHeight="h-[92dvh] sm:h-[640px] max-h-[calc(100dvh-1.5rem)]"
      closeOnOverlayClick={false}
      ariaLabel={conversacion?.tituloContexto || 'Conversación de Soporte'}
    >
      {/* ========================================================= */}
      {/* 1. ENCABEZADO FIJO (flex-shrink-0)                         */}
      {/* ========================================================= */}
      <header className="flex-shrink-0 p-4 bg-[#1e293b]/90 border-b border-[#334155] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#22D3EE] flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-bold text-white text-sm sm:text-base truncate">
                {conversacion?.tituloContexto || 'Conversación de Soporte'}
              </h3>
              {conversacion && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    conversacion.estado === 'ABIERTA'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {conversacion.estado}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-inter truncate">
              {conversacion
                ? `Origen: ${conversacion.tipoOrigen === 'PEDIDO' ? 'Pedido' : 'Solicitud Técnica'} #${conversacion.entidadId}`
                : 'Cargando conversación...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdmin && conversacion && conversacion.estado === 'ABIERTA' && (
            <button
              type="button"
              onClick={handleCerrarConversacion}
              className="px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-inter font-medium transition-colors flex items-center gap-1.5"
              title="Cerrar conversación de forma definitiva"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Caso</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => cargarDatos(false)}
            className="p-2 text-slate-400 hover:text-[#22D3EE] transition-colors rounded-lg hover:bg-[#334155]/40"
            title="Refrescar mensajes"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-[#334155]/40"
            title="Cerrar ventana (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Alerta de Error (si existe) */}
      {error && (
        <div className="flex-shrink-0 bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HISTORIAL DE MENSAJES (flex-1 min-h-0 overflow-y-auto)  */}
      {/* ========================================================= */}
      <main
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-[#0B0F1A]/85 font-inter overscroll-contain"
      >
        {cargando && mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2 min-h-[200px]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7C3AED]" />
            <p>Conectando con la conversación...</p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6 min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center mb-3 text-slate-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-300">No hay mensajes previos</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Inicia la conversación sobre este caso. Un miembro del equipo responderá a la brevedad.
            </p>
          </div>
        ) : (
          mensajes.map((m) => {
            const esPropio = isAdmin ? m.remitenteRol === 'ADMIN' : m.remitenteRol === 'CLIENTE';
            const esSistema = m.remitenteRol === 'SISTEMA';

            if (esSistema) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <span className="text-[11px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 font-medium">
                    {m.contenido}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${esPropio ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">
                    {m.remitenteNombre || (m.remitenteRol === 'ADMIN' ? 'Soporte Noctis' : 'Cliente')}
                  </span>
                  {m.remitenteRol === 'ADMIN' && (
                    <span className="text-[9px] bg-[#7C3AED]/20 text-[#22D3EE] px-1.5 py-0.2 rounded border border-[#7C3AED]/40 font-bold">
                      STAFF
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(m.fechaHora || m.fechaCreacion || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md break-words ${
                    esPropio
                      ? 'bg-[#7C3AED] text-white rounded-br-sm'
                      : 'bg-[#1e293b] text-slate-200 border border-[#334155] rounded-bl-sm'
                  }`}
                >
                  {m.contenido}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. ÁREA DE ESCRITURA FIJA (flex-shrink-0)                  */}
      {/* ========================================================= */}
      <footer className="flex-shrink-0 p-3 bg-[#1e293b]/90 border-t border-[#334155]">
        {conversacion?.estado === 'CERRADA' ? (
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-700/60 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            Esta conversación ha sido finalizada y cerrada por el equipo de soporte.
          </div>
        ) : (
          <form onSubmit={handleEnviar} className="flex gap-2 items-center">
            <div className="flex-1">
              <CustomInput
                type="text"
                placeholder="Escribe tu consulta o respuesta..."
                value={nuevoMensaje}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNuevoMensaje(e.target.value)}
                disabled={cargando || enviando}
                className="bg-[#0B0F1A]/90 border-[#334155]"
              />
            </div>
            <button
              type="submit"
              disabled={!nuevoMensaje.trim() || enviando || cargando}
              className="h-11 px-5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-inter font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20 transition-all active:scale-95 flex-shrink-0"
            >
              {enviando ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </>
              )}
            </button>
          </form>
        )}
      </footer>
    </BaseModal>
  );
};

export default ChatModal;
