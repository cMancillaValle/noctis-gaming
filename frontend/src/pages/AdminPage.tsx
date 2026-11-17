import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  ShoppingCart,
  FileText,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Users,
  X,
  Save,
  LogIn,
  ArrowLeft,
  Wrench,
  MessageSquare,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Cliente,
  Conversacion,
  Factura,
  InventarioItem,
  Producto,
  ProductoUpdateInput,
  SolicitudTecnica,
  Venta,
} from '../types';
import {
  clientesApi,
  conversacionesApi,
  facturasApi,
  inventarioApi,
  productosApi,
  solicitudesApi,
  ventasApi,
} from '../services/api';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { FormField, CustomInput, CustomTextarea } from '../components/form';
import { ChatModal } from '../components/ChatModal';
import BaseModal from '../components/BaseModal';

export const AdminPage: React.FC = () => {
  const { isAdmin, isLoggedIn, setIsLoginModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'productos' | 'inventario' | 'solicitudes' | 'mensajes' | 'ventas' | 'facturas' | 'clientes'
  >('productos');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudTecnica[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Filtros y ordenación en Inventario
  const [inventarioOrden, setInventarioOrden] = useState<'nombre' | 'id'>('nombre');
  const [inventarioFiltro, setInventarioFiltro] = useState<'todos' | 'con_stock' | 'sin_stock' | 'sin_registro'>('todos');

  // Filtros en Solicitudes
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState<string>('TODAS');

  // Filtros en Mensajes
  const [filtroTipoConversacion, setFiltroTipoConversacion] = useState<string>('TODAS');
  const [filtroEstadoConversacion, setFiltroEstadoConversacion] = useState<string>('TODAS');

  // Modal de chat contextual
  const [chatModalConfig, setChatModalConfig] = useState<{
    isOpen: boolean;
    conversacionId?: number;
    tipoOrigen?: 'PEDIDO' | 'SOLICITUD_TECNICA';
    entidadId?: number;
  }>({ isOpen: false });

  // Formulario nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCat, setNuevaCat] = useState('Consolas');
  const [nuevaImagen, setNuevaImagen] = useState('/images/products/custom.png');

  // Modal edición completa de producto
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editForm, setEditForm] = useState<ProductoUpdateInput>({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: 'Consolas',
    imagenUrl: '',
    activo: true,
  });

  // Modal edición de cliente
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editClienteForm, setEditClienteForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  // Edición rápida de stock en inventario
  const [editStockId, setEditStockId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState('');

  const categoryOptions: SelectOption[] = [
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Controles', label: 'Controles' },
    { value: 'Videojuegos', label: 'Videojuegos' },
    { value: 'Periféricos', label: 'Periféricos' },
    { value: 'Accesorios', label: 'Accesorios' },
  ];

  const estadoSolicitudOptions: SelectOption[] = [
    { value: 'TODAS', label: 'Todas las solicitudes' },
    { value: 'RECIBIDA', label: 'RECIBIDA' },
    { value: 'EN_REVISION', label: 'EN_REVISION' },
    { value: 'EN_PROCESO', label: 'EN_PROCESO' },
    { value: 'RESUELTA', label: 'RESUELTA' },
    { value: 'CANCELADA', label: 'CANCELADA' },
  ];

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadTabData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setFeedback(null);
    try {
      if (activeTab === 'productos') {
        const data = await productosApi.listarAdmin();
        setProductos(data);
      } else if (activeTab === 'inventario') {
        const [invData, prodData] = await Promise.all([
          inventarioApi.listar(),
          productosApi.listarAdmin(),
        ]);
        setInventario(invData);
        setProductos(prodData);
      } else if (activeTab === 'solicitudes') {
        const data = await solicitudesApi.listarTodas();
        setSolicitudes(data);
      } else if (activeTab === 'mensajes') {
        const data = await conversacionesApi.listar();
        setConversaciones(data);
      } else if (activeTab === 'ventas') {
        const data = await ventasApi.listar();
        setVentas(data);
      } else if (activeTab === 'facturas') {
        const data = await facturasApi.listar();
        setFacturas(data);
      } else if (activeTab === 'clientes') {
        const data = await clientesApi.listar();
        setClientes(data);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message || 'Error al consultar información administrativa.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadTabData();
    }
  }, [isAdmin, activeTab]);

  // Manejo de creación de nuevo producto
  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const precioNum = parseFloat(nuevoPrecio);
      if (isNaN(precioNum) || precioNum <= 0) {
        setFeedback({ type: 'error', message: 'Ingresa un precio válido en pesos colombianos.' });
        return;
      }
      await productosApi.crear({
        nombre: nuevoNombre.trim(),
        descripcion: nuevaDesc.trim(),
        precio: precioNum,
        categoria: nuevaCat,
        imagenUrl: nuevaImagen.trim() || undefined,
      });
      setFeedback({ type: 'success', message: `Producto '${nuevoNombre}' creado exitosamente en el catálogo.` });
      setNuevoNombre('');
      setNuevaDesc('');
      setNuevoPrecio('');
      loadTabData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message || 'Error al crear el producto.' });
    }
  };

  // Abrir modal de edición de producto precargado
  const handleOpenEditProduct = (p: Producto) => {
    setEditingProduct(p);
    setEditForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      categoria: p.categoria,
      imagenUrl: p.imagenUrl || '',
      activo: p.activo,
    });
  };

  // Guardar edición completa de producto
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (!editForm.nombre.trim()) throw new Error('El nombre no puede estar vacío');
      if (editForm.precio <= 0) throw new Error('El precio debe ser mayor a 0');

      await productosApi.actualizarCompleto(editingProduct.id, editForm);
      setFeedback({ type: 'success', message: `Producto '${editForm.nombre}' actualizado con éxito.` });
      setEditingProduct(null);
      loadTabData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message || 'Error al actualizar producto.' });
    }
  };

  // Ajuste de stock en inventario (tanto existente como inicial)
  const handleActualizarStock = async (productoId: number) => {
    try {
      const stockNum = parseInt(editStockValue, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        setFeedback({ type: 'error', message: 'Ingresa un valor numérico válido mayor o igual a 0.' });
        return;
      }
      await inventarioApi.actualizarStock(productoId, stockNum, 'BODEGA-CENTRAL');
      setFeedback({ type: 'success', message: `Stock actualizado a ${stockNum} unidades para el producto #${productoId}.` });
      setEditStockId(null);
      setEditStockValue('');
      loadTabData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message });
    }
  };

  // Actualizar estado de solicitud técnica
  const handleActualizarEstadoSolicitud = async (solicitudId: number, nuevoEstado: string) => {
    try {
      await solicitudesApi.actualizarEstado(solicitudId, nuevoEstado);
      setFeedback({ type: 'success', message: `Estado de la solicitud #${solicitudId} actualizado a ${nuevoEstado}.` });
      loadTabData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message || 'Error al actualizar estado.' });
    }
  };

  // Abrir modal de edición de cliente
  const handleOpenEditCliente = (c: Cliente) => {
    setEditingCliente(c);
    setEditClienteForm({
      nombre: c.nombre,
      telefono: c.telefono,
      direccion: c.direccion,
    });
  };

  // Guardar edición de cliente
  const handleSaveClienteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente) return;
    try {
      await clientesApi.actualizar(editingCliente.id, {
        nombre: editClienteForm.nombre.trim(),
        telefono: editClienteForm.telefono.trim(),
        direccion: editClienteForm.direccion.trim(),
      });
      setFeedback({ type: 'success', message: `Datos del cliente #${editingCliente.id} actualizados.` });
      setEditingCliente(null);
      loadTabData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.mensaje || err.message });
    }
  };

  // Inventario cruzado y ordenado
  const inventarioCruzado = useMemo(() => {
    const mapaInv = new Map<number, InventarioItem>();
    inventario.forEach((inv) => mapaInv.set(inv.productoId, inv));

    const lista = productos.map((prod) => {
      const inv = mapaInv.get(prod.id);
      return {
        productoId: prod.id,
        productoNombre: prod.nombre,
        categoria: prod.categoria,
        precio: prod.precio,
        inventarioId: inv ? inv.id : null,
        cantidadDisponible: inv ? inv.cantidadDisponible : 0,
        ubicacionAlmacen: inv ? inv.ubicacionAlmacen : 'BODEGA-CENTRAL',
        tieneRegistro: !!inv,
      };
    });

    // Filtros
    let filtrada = lista;
    if (inventarioFiltro === 'con_stock') {
      filtrada = lista.filter((i) => i.tieneRegistro && i.cantidadDisponible > 0);
    } else if (inventarioFiltro === 'sin_stock') {
      filtrada = lista.filter((i) => i.tieneRegistro && i.cantidadDisponible === 0);
    } else if (inventarioFiltro === 'sin_registro') {
      filtrada = lista.filter((i) => !i.tieneRegistro);
    }

    // Ordenamiento
    return filtrada.sort((a, b) => {
      if (inventarioOrden === 'nombre') {
        return a.productoNombre.localeCompare(b.productoNombre);
      } else {
        return a.productoId - b.productoId;
      }
    });
  }, [productos, inventario, inventarioOrden, inventarioFiltro]);

  // Solicitudes filtradas
  const solicitudesFiltradas = useMemo(() => {
    if (filtroEstadoSolicitud === 'TODAS') return solicitudes;
    return solicitudes.filter((s) => s.estado === filtroEstadoSolicitud);
  }, [solicitudes, filtroEstadoSolicitud]);

  // Conversaciones filtradas
  const conversacionesFiltradas = useMemo(() => {
    return conversaciones.filter((c) => {
      const cumpleTipo = filtroTipoConversacion === 'TODAS' || c.tipoOrigen === filtroTipoConversacion;
      const cumpleEstado = filtroEstadoConversacion === 'TODAS' || c.estado === filtroEstadoConversacion;
      return cumpleTipo && cumpleEstado;
    });
  }, [conversaciones, filtroTipoConversacion, filtroEstadoConversacion]);

  // Vista si no es administrador
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 font-inter">
        <div className="rounded-3xl bg-noctis-card border border-rose-500/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-white">
              Panel Administrativo Restringido
            </h1>
            <p className="text-xs sm:text-sm text-noctis-muted max-w-md mx-auto leading-relaxed">
              Esta sección requiere permisos oficiales de nivel <strong>ADMIN</strong>. Inicia sesión con las credenciales de administración autorizadas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleDark text-white text-xs font-semibold hover:from-noctis-purpleLight transition-all flex items-center justify-center gap-2 shadow-glow-purple"
            >
              <LogIn className="w-4 h-4 text-noctis-cyan" />
              <span>Iniciar Sesión de Administrador</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-noctis-surface text-white text-xs font-semibold hover:bg-noctis-surface/80 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-noctis-surface/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-noctis-purple/30 text-noctis-purpleLight border border-noctis-purple/50 uppercase tracking-wider">
              Control Maestro
            </span>
            <span className="text-xs text-noctis-cyan font-semibold uppercase tracking-widest">• Noctis Gaming</span>
          </div>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            ADMINISTRACIÓN GENERAL
          </h1>
          <p className="text-xs text-noctis-muted mt-1 font-inter">
            Catálogo comercial, inventario físico, solicitudes de servicio, soporte contextual y ventas de la plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadTabData()}
            className="px-4 py-2 rounded-xl bg-noctis-surface hover:bg-noctis-surface/80 text-white text-xs font-medium flex items-center gap-2 transition-colors border border-noctis-surface/80"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-noctis-cyan ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500/50 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-noctis-surface/60 pb-3">
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'productos'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <Package className="w-4 h-4 text-noctis-cyan" />
          <span>Catálogo de Productos</span>
        </button>

        <button
          onClick={() => setActiveTab('inventario')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'inventario'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <Boxes className="w-4 h-4 text-noctis-cyan" />
          <span>Inventario & Existencias</span>
        </button>

        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'solicitudes'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <Wrench className="w-4 h-4 text-noctis-cyan" />
          <span>Solicitudes Técnicas</span>
        </button>

        <button
          onClick={() => setActiveTab('mensajes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'mensajes'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-noctis-cyan" />
          <span>Inbox de Soporte</span>
        </button>

        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'ventas'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-noctis-cyan" />
          <span>Registro de Ventas</span>
        </button>

        <button
          onClick={() => setActiveTab('facturas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'facturas'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <FileText className="w-4 h-4 text-noctis-cyan" />
          <span>Facturación Digital</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'clientes'
              ? 'bg-noctis-purple text-white shadow-glow-purple'
              : 'bg-noctis-card text-noctis-muted hover:text-white hover:bg-noctis-surface'
          }`}
        >
          <Users className="w-4 h-4 text-noctis-cyan" />
          <span>Directorio de Clientes</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: PRODUCTOS */}
      {activeTab === 'productos' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Formulario Crear Producto con componentes globales */}
          <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 p-6 space-y-4">
            <h3 className="font-poppins font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-noctis-cyan" />
              <span>Registrar Nuevo Producto en Catálogo</span>
            </h3>

            <form onSubmit={handleCrearProducto} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Nombre del Producto" required>
                <CustomInput
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Teclado Mecánico RGB"
                  required
                />
              </FormField>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-inter">
                  Categoría <span className="text-[#22D3EE]">*</span>
                </label>
                <CustomSelect
                  options={categoryOptions}
                  value={nuevaCat}
                  onChange={setNuevaCat}
                  placeholder="Categoría..."
                />
              </div>

              <FormField label="Precio COP" required>
                <CustomInput
                  type="number"
                  step="1"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  placeholder="Ej: 350000"
                  required
                />
              </FormField>

              <FormField label="URL de Imagen">
                <CustomInput
                  type="text"
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  placeholder="/images/products/custom.png"
                />
              </FormField>

              <div className="sm:col-span-2 lg:col-span-4">
                <FormField label="Descripción Comercial" required>
                  <CustomTextarea
                    rows={2}
                    value={nuevaDesc}
                    onChange={(e) => setNuevaDesc(e.target.value)}
                    placeholder="Detalles comerciales y especificaciones..."
                    required
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleDark text-white text-xs font-semibold hover:from-noctis-purpleLight transition-all shadow-glow-purple flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar en Catálogo</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Productos */}
          <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-noctis-surface/60 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">Productos registrados: {productos.length}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right">Precio Oficial (COP)</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {productos.map((p) => (
                  <tr key={p.id} className="text-white hover:bg-noctis-surfaceDark/30">
                    <td className="p-4 font-sans text-noctis-muted font-medium">#{p.id}</td>
                    <td className="p-4 font-semibold">{p.nombre}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-noctis-surfaceDark text-[11px] text-noctis-cyan border border-noctis-surface/50 font-medium">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans font-bold text-noctis-cyan">
                      {formatCOP(p.precio)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.activo
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-noctis-surface hover:bg-noctis-purple text-xs text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-noctis-cyan" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN COMPLETA DE PRODUCTO */}
      {editingProduct && (
        <BaseModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          maxWidth="max-w-lg"
          maxHeight="max-h-[calc(100dvh-2rem)] sm:max-h-[min(92dvh,650px)]"
          zIndexClass="z-50"
          ariaLabel="Editar Producto"
        >
          <div className="relative p-6 sm:p-8 space-y-4 overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-2 border-b border-noctis-surface/60">
              <h3 className="font-poppins font-bold text-lg text-white">Editar Producto</h3>
              <p className="text-xs text-noctis-muted">ID #{editingProduct.id} en Catálogo</p>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              <FormField label="Nombre Comercial" required>
                <CustomInput
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-inter">
                    Categoría <span className="text-[#22D3EE]">*</span>
                  </label>
                  <CustomSelect
                    options={categoryOptions}
                    value={editForm.categoria}
                    onChange={(cat) => setEditForm({ ...editForm, categoria: cat })}
                  />
                </div>

                <FormField label="Precio COP" required>
                  <CustomInput
                    type="number"
                    required
                    value={editForm.precio.toString()}
                    onChange={(e) => setEditForm({ ...editForm, precio: parseFloat(e.target.value) || 0 })}
                  />
                </FormField>
              </div>

              <FormField label="Descripción">
                <CustomTextarea
                  rows={2}
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                />
              </FormField>

              <FormField label="URL de Imagen">
                <CustomInput
                  type="text"
                  value={editForm.imagenUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, imagenUrl: e.target.value })}
                  placeholder="https://..."
                />
              </FormField>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activo-check"
                  checked={editForm.activo}
                  onChange={(e) => setEditForm({ ...editForm, activo: e.target.checked })}
                  className="rounded text-noctis-cyan focus:ring-noctis-cyan h-4 w-4 bg-noctis-bg border-noctis-surface"
                />
                <label htmlFor="activo-check" className="text-xs text-white cursor-pointer select-none">
                  Producto activo para venta en la tienda
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-noctis-surface/60">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-noctis-text hover:bg-noctis-surface/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleLight text-white text-xs font-semibold shadow-glow-purple"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </BaseModal>
      )}

      {/* CONTENIDO PESTAÑA 2: INVENTARIO (CRUZADO Y REPARADO) */}
      {activeTab === 'inventario' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-poppins font-bold text-base text-white">Existencias por Producto en Almacén</h3>
              <p className="text-xs text-noctis-muted">
                Cruce total de catálogo e inventario. Se identifican nombres reales y productos sin registro de existencias (como el ID 13).
              </p>
            </div>

            {/* Controles de ordenamiento y filtrado */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0B0F1A]/70 px-3 py-1.5 rounded-xl border border-[#334155]">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span className="text-xs text-slate-400">Ordenar por:</span>
                <button
                  type="button"
                  onClick={() => setInventarioOrden('nombre')}
                  className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                    inventarioOrden === 'nombre' ? 'bg-[#7C3AED] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nombre (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => setInventarioOrden('id')}
                  className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                    inventarioOrden === 'id' ? 'bg-[#7C3AED] text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ID Producto
                </button>
              </div>

              <div className="flex items-center gap-1 bg-[#0B0F1A]/70 px-2 py-1 rounded-xl border border-[#334155]">
                {(['todos', 'con_stock', 'sin_stock', 'sin_registro'] as const).map((modo) => (
                  <button
                    key={modo}
                    type="button"
                    onClick={() => setInventarioFiltro(modo)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors capitalize ${
                      inventarioFiltro === modo
                        ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {modo === 'sin_registro' ? 'Sin Registro' : modo.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
              <tr>
                <th className="p-4">ID Prod.</th>
                <th className="p-4">ID Inv.</th>
                <th className="p-4">Nombre Real del Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Ubicación Bodega</th>
                <th className="p-4 text-center">Disponible</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noctis-surface/30">
              {inventarioCruzado.map((item) => (
                <tr key={item.productoId} className="text-white hover:bg-noctis-surfaceDark/30">
                  <td className="p-4 font-sans text-[#22D3EE] font-bold">#{item.productoId}</td>
                  <td className="p-4 font-sans text-noctis-muted">
                    {item.inventarioId ? `#${item.inventarioId}` : (
                      <span className="text-amber-400/80 text-[10px] font-semibold">Sin fila</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span>{item.productoNombre}</span>
                      {!item.tieneRegistro && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          Sin registro de existencias
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-noctis-muted">{item.categoria}</td>
                  <td className="p-4 text-noctis-muted">{item.ubicacionAlmacen}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-sans font-bold text-xs ${
                        !item.tieneRegistro
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                          : item.cantidadDisponible > 5
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.cantidadDisponible} unidades
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {editStockId === item.productoId ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(e.target.value)}
                          placeholder="Cant."
                          className="w-20 px-2 py-1 rounded-lg bg-noctis-surfaceDark border border-noctis-cyan text-xs font-sans text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleActualizarStock(item.productoId)}
                          className="px-2.5 py-1 rounded-lg bg-noctis-cyan text-noctis-bg font-bold text-xs"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditStockId(null);
                            setEditStockValue('');
                          }}
                          className="px-2 py-1 rounded-lg bg-noctis-surface text-white text-xs"
                        >
                          X
                        </button>
                      </div>
                    ) : item.tieneRegistro ? (
                      <button
                        onClick={() => {
                          setEditStockId(item.productoId);
                          setEditStockValue(item.cantidadDisponible.toString());
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-noctis-surface hover:bg-noctis-purple text-xs text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-noctis-cyan" />
                        <span>Ajustar Cantidad</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditStockId(item.productoId);
                          setEditStockValue('10');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-amber-300 transition-colors font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Asignar Stock Inicial</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: SOLICITUDES TÉCNICAS */}
      {activeTab === 'solicitudes' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-poppins font-bold text-base text-white">Solicitudes Técnicas de Clientes</h3>
              <p className="text-xs text-noctis-muted">
                Gestión operativa de mantenimientos, diagnósticos y reparaciones radicadas en la plataforma.
              </p>
            </div>

            <div className="w-64">
              <CustomSelect
                options={estadoSolicitudOptions}
                value={filtroEstadoSolicitud}
                onChange={setFiltroEstadoSolicitud}
                placeholder="Filtrar por estado..."
              />
            </div>
          </div>

          {solicitudesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No hay solicitudes técnicas que coincidan con el filtro seleccionado.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
                <tr>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Cliente / Contacto</th>
                  <th className="p-4">Servicio & Dispositivo</th>
                  <th className="p-4">Ciudad</th>
                  <th className="p-4">Fecha Radicado</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {solicitudesFiltradas.map((s) => (
                  <tr key={s.id} className="text-white hover:bg-noctis-surfaceDark/30">
                    <td className="p-4 font-bold text-[#22D3EE] font-poppins">{s.numeroSolicitud || s.numeroTicket}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{s.clienteNombre || s.nombreContacto}</div>
                      <div className="text-[11px] text-slate-400">{s.clienteTelefono || s.telefonoContacto}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200 capitalize">{(s.servicioTipo || s.tipoServicio || '').replace('-', ' ')}</div>
                      <div className="text-[11px] text-slate-400">{s.marcaModelo} ({s.dispositivoTipo || s.tipoDispositivo})</div>
                    </td>
                    <td className="p-4 text-slate-300 capitalize">{s.ciudad || s.ciudadAtencion}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(s.fechaCreacion).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={s.estado}
                        onChange={(e) => handleActualizarEstadoSolicitud(s.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-900 focus:outline-none cursor-pointer ${
                          s.estado === 'RECIBIDA'
                            ? 'text-cyan-400 border-cyan-500/40'
                            : s.estado === 'EN_REVISION'
                            ? 'text-amber-400 border-amber-500/40'
                            : s.estado === 'EN_PROCESO'
                            ? 'text-purple-400 border-purple-500/40'
                            : s.estado === 'RESUELTA'
                            ? 'text-emerald-400 border-emerald-500/40'
                            : 'text-rose-400 border-rose-500/40'
                        }`}
                      >
                        <option value="RECIBIDA">RECIBIDA</option>
                        <option value="EN_REVISION">EN_REVISION</option>
                        <option value="EN_PROCESO">EN_PROCESO</option>
                        <option value="RESUELTA">RESUELTA</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setChatModalConfig({
                            isOpen: true,
                            tipoOrigen: 'SOLICITUD_TECNICA',
                            entidadId: s.id,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/40 border border-[#7C3AED]/40 text-[#22D3EE] text-xs font-medium transition-colors"
                        title="Abrir conversación con el cliente"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Soporte</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 4: INBOX DE SOPORTE */}
      {activeTab === 'mensajes' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-poppins font-bold text-base text-white">Bandeja Unificada de Soporte y Mensajería</h3>
              <p className="text-xs text-noctis-muted">
                Conversaciones directas y contextuales asociadas a pedidos de compra o solicitudes técnicas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0B0F1A]/70 px-3 py-1.5 rounded-xl border border-[#334155]">
                <span className="text-xs text-slate-400">Origen:</span>
                <button
                  type="button"
                  onClick={() => setFiltroTipoConversacion('TODAS')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroTipoConversacion === 'TODAS' ? 'bg-[#7C3AED] text-white' : 'text-slate-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoConversacion('PEDIDO')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroTipoConversacion === 'PEDIDO' ? 'bg-[#7C3AED] text-white' : 'text-slate-400'
                  }`}
                >
                  Pedidos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoConversacion('SOLICITUD_TECNICA')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroTipoConversacion === 'SOLICITUD_TECNICA' ? 'bg-[#7C3AED] text-white' : 'text-slate-400'
                  }`}
                >
                  Soporte Técnico
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#0B0F1A]/70 px-3 py-1.5 rounded-xl border border-[#334155]">
                <span className="text-xs text-slate-400">Estado:</span>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoConversacion('TODAS')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroEstadoConversacion === 'TODAS' ? 'bg-[#7C3AED] text-white' : 'text-slate-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoConversacion('ABIERTA')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroEstadoConversacion === 'ABIERTA' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Abiertas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstadoConversacion('CERRADA')}
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    filtroEstadoConversacion === 'CERRADA' ? 'bg-slate-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Cerradas
                </button>
              </div>
            </div>
          </div>

          {conversacionesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No hay conversaciones registradas en esta vista.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Contexto</th>
                  <th className="p-4">Tipo Origen</th>
                  <th className="p-4">Entidad ID</th>
                  <th className="p-4">Último Mensaje</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {conversacionesFiltradas.map((conv) => (
                  <tr key={conv.id} className="text-white hover:bg-noctis-surfaceDark/30">
                    <td className="p-4 font-bold text-[#22D3EE]">#{conv.id}</td>
                    <td className="p-4 font-medium">
                      <div className="text-white">{conv.tituloContexto}</div>
                      {conv.unreadCount > 0 && (
                        <span className="text-[10px] bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-bold">
                          {conv.unreadCount} sin leer
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {conv.tipoOrigen}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">#{conv.entidadId}</td>
                    <td className="p-4 text-slate-400">
                      {conv.fechaUltimaActividad || conv.fechaCreacion
                        ? new Date(conv.fechaUltimaActividad || conv.fechaCreacion).toLocaleString('es-CO')
                        : 'Sin mensajes aún'}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          conv.estado === 'ABIERTA'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {conv.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setChatModalConfig({
                            isOpen: true,
                            conversacionId: conv.id,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleDark text-white text-xs font-semibold hover:from-noctis-purpleLight transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-noctis-cyan" />
                        <span>Abrir Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 5: VENTAS */}
      {activeTab === 'ventas' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60">
            <h3 className="font-poppins font-bold text-base text-white">Historial de Órdenes y Ventas</h3>
            <p className="text-xs text-noctis-muted">Registro consolidado de compras procesadas con éxito</p>
          </div>

          {ventas.length === 0 ? (
            <div className="p-12 text-center text-noctis-muted text-xs">No hay ventas registradas aún.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
                <tr>
                  <th className="p-4">No. Venta</th>
                  <th className="p-4">Cliente ID</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Factura Asoc.</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Total (COP)</th>
                  <th className="p-4 text-center">Soporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {ventas.map((v) => (
                  <tr key={v.id} className="text-white hover:bg-noctis-surfaceDark/30">
                    <td className="p-4 font-sans font-bold text-noctis-cyan">{v.numeroVenta}</td>
                    <td className="p-4 font-sans text-noctis-muted">Cliente #{v.clienteId}</td>
                    <td className="p-4 text-noctis-muted">{new Date(v.fechaCreacion).toLocaleString('es-CO')}</td>
                    <td className="p-4 font-sans text-noctis-purpleLight font-semibold">{v.numeroFactura || 'En proceso'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {v.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans font-bold">{formatCOP(v.total)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setChatModalConfig({
                            isOpen: true,
                            tipoOrigen: 'PEDIDO',
                            entidadId: v.id,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] border border-slate-700"
                        title="Abrir conversación sobre este pedido"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 6: FACTURAS */}
      {activeTab === 'facturas' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60">
            <h3 className="font-poppins font-bold text-base text-white">Comprobantes y Facturación Oficial</h3>
            <p className="text-xs text-noctis-muted">Documentos fiscales digitales con desglose de IVA (19%)</p>
          </div>

          {facturas.length === 0 ? (
            <div className="p-12 text-center text-noctis-muted text-xs">No hay facturas emitidas aún.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
                <tr>
                  <th className="p-4">No. Factura</th>
                  <th className="p-4">Venta ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-right">IVA (19%)</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noctis-surface/30">
                {facturas.map((f) => (
                  <tr key={f.id} className="text-white hover:bg-noctis-surfaceDark/30">
                    <td className="p-4 font-sans font-bold text-noctis-cyan">{f.numeroFactura}</td>
                    <td className="p-4 font-sans text-noctis-muted">Venta #{f.ventaId}</td>
                    <td className="p-4 font-medium">{f.clienteNombre}</td>
                    <td className="p-4 text-right font-sans text-noctis-muted">{formatCOP(f.subtotal)}</td>
                    <td className="p-4 text-right font-sans text-noctis-muted">{formatCOP(f.impuestos)}</td>
                    <td className="p-4 text-right font-sans font-bold text-noctis-purpleLight">{formatCOP(f.total)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {f.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 7: CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="rounded-3xl bg-noctis-card border border-noctis-surface/70 overflow-hidden shadow-xl animate-in fade-in duration-200">
          <div className="p-6 border-b border-noctis-surface/60">
            <h3 className="font-poppins font-bold text-base text-white">Directorio de Clientes</h3>
            <p className="text-xs text-noctis-muted">Consulta y actualización de perfiles registrados en la tienda</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-noctis-surfaceDark/60 border-b border-noctis-surface text-noctis-muted font-semibold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Dirección</th>
                <th className="p-4 text-center">Rol</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noctis-surface/30">
              {clientes.map((c) => (
                <tr key={c.id} className="text-white hover:bg-noctis-surfaceDark/30">
                  <td className="p-4 font-sans text-noctis-muted font-medium">#{c.id}</td>
                  <td className="p-4 font-semibold">{c.nombre}</td>
                  <td className="p-4 text-noctis-muted">{c.email}</td>
                  <td className="p-4 text-noctis-muted">{c.telefono}</td>
                  <td className="p-4 text-noctis-muted truncate max-w-xs">{c.direccion}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.rol === 'ADMIN'
                          ? 'bg-noctis-purple/30 text-noctis-purpleLight border border-noctis-purple/40'
                          : 'bg-noctis-cyan/20 text-noctis-cyan border border-noctis-cyan/30'
                      }`}
                    >
                      {c.rol || 'CLIENTE'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenEditCliente(c)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-noctis-surface hover:bg-noctis-purple text-xs text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-noctis-cyan" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE CLIENTE */}
      {editingCliente && (
        <BaseModal
          isOpen={!!editingCliente}
          onClose={() => setEditingCliente(null)}
          maxWidth="max-w-md"
          maxHeight="max-h-[calc(100dvh-2rem)] sm:max-h-[min(92dvh,550px)]"
          zIndexClass="z-50"
          ariaLabel="Editar Perfil de Cliente"
        >
          <div className="relative p-6 sm:p-8 space-y-4 overflow-y-auto">
            <button
              onClick={() => setEditingCliente(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-noctis-muted hover:text-white hover:bg-noctis-surface/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-2 border-b border-noctis-surface/60">
              <h3 className="font-poppins font-bold text-lg text-white">Editar Perfil de Cliente</h3>
              <p className="text-xs text-noctis-muted">Modificar información del cliente #{editingCliente.id} ({editingCliente.email})</p>
            </div>

            <form onSubmit={handleSaveClienteEdit} className="space-y-4">
              <FormField label="Nombre Completo" required>
                <CustomInput
                  type="text"
                  required
                  value={editClienteForm.nombre}
                  onChange={(e) => setEditClienteForm({ ...editClienteForm, nombre: e.target.value })}
                />
              </FormField>

              <FormField label="Teléfono" required>
                <CustomInput
                  type="tel"
                  required
                  value={editClienteForm.telefono}
                  onChange={(e) => setEditClienteForm({ ...editClienteForm, telefono: e.target.value })}
                />
              </FormField>

              <FormField label="Dirección de Entrega" required>
                <CustomInput
                  type="text"
                  required
                  value={editClienteForm.direccion}
                  onChange={(e) => setEditClienteForm({ ...editClienteForm, direccion: e.target.value })}
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-3 border-t border-noctis-surface/60">
                <button
                  type="button"
                  onClick={() => setEditingCliente(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-noctis-text hover:bg-noctis-surface/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleLight text-white text-xs font-semibold shadow-glow-purple"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </BaseModal>
      )}

      {/* MODAL DE CHAT CONTEXTUAL ADMINISTRATIVO */}
      <ChatModal
        isOpen={chatModalConfig.isOpen}
        onClose={() => setChatModalConfig({ isOpen: false })}
        conversacionId={chatModalConfig.conversacionId}
        tipoOrigen={chatModalConfig.tipoOrigen}
        entidadId={chatModalConfig.entidadId}
        isAdmin={true}
      />
    </div>
  );
};
