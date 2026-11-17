import {
  Cliente,
  ClienteUpdateInput,
  Conversacion,
  CrearSolicitudInput,
  Factura,
  InventarioItem,
  LoginResponse,
  Mensaje,
  Producto,
  ProductoUpdateInput,
  SolicitudTecnica,
  TipoOrigenConversacion,
  Venta,
} from '../types';

const API_BASE = ''; // Uses Vite proxy in dev and Nginx in Docker

export const getToken = (): string | null => {
  try {
    return localStorage.getItem('noctis_token');
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem('noctis_token', token);
    } else {
      localStorage.removeItem('noctis_token');
    }
  } catch (e) {
    console.error('Error al guardar token:', e);
  }
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // Body not JSON
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Microservicio Clientes (Puerto 8081)
export const clientesApi = {
  listar: () => request<Cliente[]>('/api/clientes'),
  obtenerPorId: (id: number) => request<Cliente>(`/api/clientes/${id}`),
  obtenerPorEmail: (email: string) => request<Cliente>(`/api/clientes/email/${encodeURIComponent(email)}`),
  registrar: (cliente: { nombre: string; email: string; telefono: string; direccion: string; password?: string }) =>
    request<Cliente>('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    }),
  login: (credenciales: { email: string; password: string }) =>
    request<LoginResponse>('/api/clientes/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    }),
  me: () => request<Cliente>('/api/clientes/me'),
  actualizarPerfil: (id: number, datos: ClienteUpdateInput) =>
    request<Cliente>(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),
  actualizar: (id: number, datos: ClienteUpdateInput) =>
    request<Cliente>(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),
};

// Microservicio Productos (Puerto 8082)
export const productosApi = {
  listar: (categoria?: string, busqueda?: string) => {
    const params = new URLSearchParams();
    if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
    if (busqueda) params.append('busqueda', busqueda);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<Producto[]>(`/api/productos${queryString}`);
  },
  listarAdmin: () => request<Producto[]>('/api/productos/admin'),
  obtenerPorId: (id: number) => request<Producto>(`/api/productos/${id}`),
  obtenerCategorias: () => request<string[]>('/api/productos/categorias'),
  crear: (producto: { nombre: string; descripcion: string; precio: number; categoria: string; imagenUrl?: string }) =>
    request<Producto>('/api/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    }),
  actualizarCompleto: (id: number, datos: ProductoUpdateInput) =>
    request<Producto>(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),
  actualizarPrecio: (id: number, nuevoPrecio: number) =>
    request<Producto>(`/api/productos/${id}/precio`, {
      method: 'PUT',
      body: JSON.stringify({ nuevoPrecio }),
    }),
};

// Microservicio Inventario (Puerto 8083)
export const inventarioApi = {
  listar: () => request<InventarioItem[]>('/api/inventario'),
  obtenerPorProductoId: (productoId: number) => request<InventarioItem>(`/api/inventario/producto/${productoId}`),
  actualizarStock: (productoId: number, cantidadDisponible: number, ubicacionAlmacen?: string) =>
    request<InventarioItem>(`/api/inventario/producto/${productoId}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidadDisponible, ubicacionAlmacen }),
    }),
};

// Microservicio Ventas (Puerto 8084)
export const ventasApi = {
  listar: () => request<Venta[]>('/api/ventas'),
  obtenerPorId: (id: number) => request<Venta>(`/api/ventas/${id}`),
  obtenerPorCliente: (clienteId: number) => request<Venta[]>(`/api/ventas/cliente/${clienteId}`),
  crearVenta: (datos: { clienteId: number; direccionEntrega: string; items: { productoId: number; cantidad: number }[] }) =>
    request<Venta>('/api/ventas', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
};

// Solicitudes Técnicas (ventas-service)
export const solicitudesApi = {
  crear: (datos: CrearSolicitudInput) =>
    request<SolicitudTecnica>('/api/solicitudes', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
  listarTodas: () => request<SolicitudTecnica[]>('/api/solicitudes'),
  listarPorCliente: (clienteId: number) => request<SolicitudTecnica[]>(`/api/solicitudes/cliente/${clienteId}`),
  obtenerPorId: (id: number) => request<SolicitudTecnica>(`/api/solicitudes/${id}`),
  actualizarEstado: (id: number, estado: string) =>
    request<SolicitudTecnica>(`/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),
};

// Inbox Contextual (ventas-service)
export const conversacionesApi = {
  obtenerOInicializarContexto: (tipoOrigen: TipoOrigenConversacion, entidadId: number) =>
    request<Conversacion>(`/api/conversaciones/contexto?tipoOrigen=${tipoOrigen}&entidadId=${entidadId}`),
  obtenerOCrearPorContexto: (tipoOrigen: TipoOrigenConversacion, entidadId: number) =>
    request<Conversacion>(`/api/conversaciones/contexto?tipoOrigen=${tipoOrigen}&entidadId=${entidadId}`),
  listar: (tipoOrigen?: TipoOrigenConversacion) => {
    const q = tipoOrigen ? `?tipoOrigen=${tipoOrigen}` : '';
    return request<Conversacion[]>(`/api/conversaciones${q}`);
  },
  obtenerPorId: (id: number) => request<Conversacion>(`/api/conversaciones/${id}`),
  listarMensajes: (id: number) => request<Mensaje[]>(`/api/conversaciones/${id}/mensajes`),
  enviarMensaje: (id: number, contenido: string) =>
    request<Mensaje>(`/api/conversaciones/${id}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ contenido }),
    }),
  cerrar: (id: number) =>
    request<Conversacion>(`/api/conversaciones/${id}/cerrar`, {
      method: 'PUT',
    }),
  cerrarConversacion: (id: number) =>
    request<Conversacion>(`/api/conversaciones/${id}/cerrar`, {
      method: 'PUT',
    }),
  marcarComoLeidos: (id: number) =>
    request<void>(`/api/conversaciones/${id}/leido`, {
      method: 'PUT',
    }),
};

// Microservicio Facturación (Puerto 8085)
export const facturasApi = {
  listar: () => request<Factura[]>('/api/facturas'),
  obtenerPorId: (id: number) => request<Factura>(`/api/facturas/${id}`),
  obtenerPorVentaId: (ventaId: number) => request<Factura>(`/api/facturas/venta/${ventaId}`),
};
