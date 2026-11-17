export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagenUrl?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface ProductoUpdateInput {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagenUrl?: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  rol?: 'CLIENTE' | 'ADMIN' | string;
  fechaRegistro?: string;
}

export interface ClienteUpdateInput {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  passwordActual?: string;
  passwordNuevo?: string;
}

export interface LoginResponse {
  token: string;
  cliente: Cliente;
}

export interface InventarioItem {
  id: number;
  productoId: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  ubicacionAlmacen?: string;
  ultimaActualizacion?: string;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface VentaItem {
  id?: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
}

export interface Venta {
  id: number;
  numeroVenta: string;
  operacionId: string;
  clienteId: number;
  direccionEntrega: string;
  total: number;
  estado: string;
  numeroFactura?: string;
  fechaCreacion: string;
  items: VentaItem[];
}

export interface FacturaItem {
  id?: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
}

export interface Factura {
  id: number;
  numeroFactura: string;
  ventaId: number;
  fechaEmision: string;
  clienteId: number;
  clienteNombre: string;
  clienteEmail: string;
  clienteDireccion: string;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: string;
  items: FacturaItem[];
}

export type EstadoSolicitudTecnica = 'RECIBIDA' | 'EN_REVISION' | 'EN_PROCESO' | 'RESUELTA' | 'CANCELADA';

export interface SolicitudTecnica {
  id: number;
  numeroSolicitud: string;
  numeroTicket?: string;
  clienteId: number;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  servicioTipo: string;
  tipoServicio?: string;
  dispositivoTipo: string;
  tipoDispositivo?: string;
  marcaModelo: string;
  sintomas: string;
  descripcionFalla?: string;
  ciudad: string;
  ciudadAtencion?: string;
  estado: EstadoSolicitudTecnica;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearSolicitudInput {
  clienteId?: number;
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  servicioTipo?: string;
  tipoServicio?: string;
  dispositivoTipo?: string;
  tipoDispositivo?: string;
  marcaModelo: string;
  sintomas?: string;
  descripcionFalla?: string;
  ciudad?: string;
  ciudadAtencion?: string;
}

export type TipoOrigenConversacion = 'PEDIDO' | 'SOLICITUD_TECNICA';
export type EstadoConversacion = 'ABIERTA' | 'CERRADA';

export interface Conversacion {
  id: number;
  tipoOrigen: TipoOrigenConversacion;
  entidadId: number;
  clienteId: number;
  tituloContexto: string;
  estado: EstadoConversacion;
  fechaCreacion: string;
  fechaUltimaActividad: string;
  unreadCount: number;
  ultimoMensaje?: string;
  ultimoMensajeFecha?: string;
  mensajesNoLeidosAdmin?: number;
  mensajesNoLeidosCliente?: number;
}

export interface Mensaje {
  id: number;
  conversacionId: number;
  remitenteId: number;
  remitenteRol: 'CLIENTE' | 'ADMIN' | 'SISTEMA' | string;
  remitenteNombre: string;
  contenido: string;
  fechaHora: string;
  fechaCreacion?: string;
  leidoPorAdmin: boolean;
  leidoPorCliente: boolean;
}
