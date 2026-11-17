import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Printer, Clock, MapPin, Mail, User, MessageSquare } from 'lucide-react';
import { Venta, Factura } from '../types';
import { ventasApi, facturasApi } from '../services/api';
import { ChatModal } from '../components/ChatModal';

export const OrderConfirmationPage: React.FC = () => {
  const { ventaId } = useParams<{ ventaId: string }>();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!ventaId) return;
      try {
        const v = await ventasApi.obtenerPorId(Number(ventaId));
        setVenta(v);

        try {
          const f = await facturasApi.obtenerPorVentaId(v.id);
          setFactura(f);
        } catch {
          console.warn('Factura en generación o consulta posterior');
        }
      } catch (err: any) {
        console.error('Error al cargar confirmación:', err);
        setError(err.message || 'No fue posible cargar el detalle de la venta.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ventaId]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrintFactura = () => {
    const originalTitle = document.title;
    const facturaNum = factura?.numeroFactura 
      ? factura.numeroFactura 
      : `FAC-2026-${String(venta?.id || 1).padStart(5, '0')}`;
    
    // Asignar el nombre requerido por el Prompt: Factura-[NUMERO_FACTURA].pdf
    document.title = `Factura-${facturaNum}.pdf`;
    window.print();

    // Restaurar después del ciclo de diálogo del navegador
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-noctis-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="font-poppins font-bold text-xl text-white">Confirmando orden y emitiendo comprobante...</h2>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <h2 className="font-poppins font-bold text-2xl text-rose-400">Error al consultar la orden</h2>
        <p className="text-sm text-noctis-muted">{error || 'La venta solicitada no existe o no pudo ser recuperada.'}</p>
        <Link to="/catalogo" className="inline-block px-6 py-2.5 rounded-xl bg-noctis-purple text-white text-xs font-semibold">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      {/* Banner de Éxito */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-noctis-card to-[#0B0F1A] border border-emerald-500/40 p-8 text-center space-y-4 shadow-glow-cyan/20">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 block">
          Transacción Verificada y Confirmada
        </span>
        <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
          ¡COMPRA REALIZADA CON ÉXITO!
        </h1>
        <p className="text-sm text-noctis-muted max-w-lg mx-auto font-sans">
          El pedido ha sido confirmado, las existencias reservadas y tu comprobante oficial emitido con garantía directa.
        </p>
      </div>

      {/* Recibo Oficial & Factura */}
      <div className="rounded-3xl bg-noctis-card border border-noctis-surface/80 p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Cabecera del Documento */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-noctis-surface/60">
          <div>
            <img src="/imagotipo-noctis.png" alt="Noctis Gaming" className="h-12 w-auto mb-3" />
            <p className="text-xs text-noctis-muted">Noctis Gaming S.A.S. • NIT: 901.884.230-1</p>
            <p className="text-xs text-noctis-muted">Cra 15 # 85-30, Bogotá D.C., Colombia</p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-noctis-purple/30 text-noctis-cyan text-xs font-semibold">
              ESTADO: {venta.estado}
            </span>
            <p className="font-poppins font-bold text-lg text-white">
              Venta: <span className="text-noctis-cyan">{venta.numeroVenta}</span>
            </p>
            {factura && (
              <p className="text-xs text-noctis-purpleLight font-semibold">
                Factura Digital: <span>{factura.numeroFactura}</span>
              </p>
            )}
            <p className="text-xs text-noctis-muted flex items-center sm:justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(venta.fechaCreacion).toLocaleString('es-CO')}</span>
            </p>
          </div>
        </div>

        {/* Datos del Cliente y Envío */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-noctis-surfaceDark/40 border border-noctis-surface/40 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-noctis-cyan block">
              Datos del Comprador
            </span>
            <div className="flex items-center gap-2 text-white font-medium">
              <User className="w-3.5 h-3.5 text-noctis-muted" />
              <span>{factura?.clienteNombre || `Cliente ID #${venta.clienteId}`}</span>
            </div>
            {factura?.clienteEmail && (
              <div className="flex items-center gap-2 text-noctis-muted">
                <Mail className="w-3.5 h-3.5 text-noctis-muted" />
                <span>{factura.clienteEmail}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-noctis-cyan block">
              Destino de Entrega
            </span>
            <div className="flex items-start gap-2 text-white font-medium">
              <MapPin className="w-3.5 h-3.5 text-noctis-muted mt-0.5" />
              <span>{venta.direccionEntrega}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Productos Adquiridos */}
        <div className="space-y-4">
          <h3 className="font-poppins font-bold text-sm text-white uppercase tracking-wider">
            Detalle de Productos Facturados
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-noctis-surface/60 text-noctis-muted">
                  <th className="py-2.5 font-semibold">Producto</th>
                  <th className="py-2.5 font-semibold text-center">Cant.</th>
                  <th className="py-2.5 font-semibold text-right">Precio Unitario</th>
                  <th className="py-2.5 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {venta.items.map((item, idx) => (
                  <tr key={idx} className="text-white">
                    <td className="py-3 font-medium">{item.productoNombre}</td>
                    <td className="py-3 text-center font-sans font-bold">{item.cantidad}</td>
                    <td className="py-3 text-right font-sans text-noctis-muted">{formatCOP(item.precioUnitario)}</td>
                    <td className="py-3 text-right font-sans font-bold text-white">{formatCOP(item.subtotalItem)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales y Liquidación de Impuestos */}
        <div className="pt-4 border-t border-noctis-surface/60 flex flex-col items-end space-y-2 text-xs">
          <div className="w-full sm:w-72 space-y-2 font-sans">
            <div className="flex justify-between text-noctis-muted">
              <span>Subtotal neto:</span>
              <span className="font-sans font-medium text-white">
                {factura ? formatCOP(factura.subtotal) : formatCOP(venta.total / 1.19)}
              </span>
            </div>
            <div className="flex justify-between text-noctis-muted">
              <span>IVA (19% discriminado):</span>
              <span className="font-sans font-medium text-white">
                {factura ? formatCOP(factura.impuestos) : formatCOP(venta.total - venta.total / 1.19)}
              </span>
            </div>
            <div className="flex justify-between text-noctis-muted">
              <span>Envío Nacional:</span>
              <span className="text-emerald-400 font-bold">GRATIS</span>
            </div>
            <div className="pt-2 border-t border-noctis-surface flex justify-between items-baseline font-bold">
              <span className="text-white text-sm">TOTAL PAGADO:</span>
              <span className="text-noctis-cyan font-sans text-xl">{formatCOP(venta.total)} COP</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-6 border-t border-noctis-surface/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 text-xs font-semibold text-noctis-cyan hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setChatOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-glow-purple"
            >
              <MessageSquare className="w-4 h-4 text-noctis-cyan" />
              <span>Consultar sobre este Pedido</span>
            </button>

            <button
              onClick={handlePrintFactura}
              className="px-5 py-2.5 rounded-xl bg-noctis-surfaceDark hover:bg-noctis-surface text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-glow-cyan/20 border border-noctis-surface hover:border-noctis-cyan/60"
            >
              <Printer className="w-4 h-4 text-noctis-cyan" />
              <span>Imprimir / Guardar Factura PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat contextual para este pedido */}
      {venta && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          tipoOrigen="PEDIDO"
          entidadId={venta.id}
          isAdmin={false}
        />
      )}
    </div>
  );
};
