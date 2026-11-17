import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ShoppingCart, Sparkles, RefreshCw } from 'lucide-react';
import { Producto } from '../types';
import { productosApi, inventarioApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { CustomSelect, SelectOption } from '../components/CustomSelect';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria') || 'Todas';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [stocks, setStocks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Producto | null>(null);

  const { addToCart } = useCart();

  const categories = ['Todas', 'Consolas', 'Controles', 'Videojuegos', 'Periféricos', 'Accesorios'];

  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat,
    label: cat === 'Todas' ? 'Todas las categorías' : cat,
  }));

  const cargarCatalogo = async (categoria?: string, busqueda?: string) => {
    setLoading(true);
    try {
      const [listaProductos, listaInventario] = await Promise.all([
        productosApi.listar(categoria === 'Todas' ? undefined : categoria, busqueda || undefined),
        inventarioApi.listar().catch(() => []),
      ]);

      const stockMap: Record<number, number> = {};
      listaInventario.forEach((inv) => {
        stockMap[inv.productoId] = inv.cantidadDisponible;
      });
      setStocks(stockMap);
      setProductos(listaProductos);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogo(selectedCategory, searchTerm);
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarCatalogo(selectedCategory, searchTerm);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Todas') {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', cat);
    }
    setSearchParams(searchParams);
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header del Catálogo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-noctis-surface/40">
        <div>
          <span className="text-xs font-semibold text-noctis-cyan uppercase tracking-widest block mb-1">
            Hardware & Gaming Original
          </span>
          <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-white">
            CATÁLOGO OFICIAL NOCTIS
          </h1>
          <p className="text-sm text-noctis-muted mt-1 font-sans">
            Explora existencias y disponibilidad en tiempo real con garantía directa de fábrica.
          </p>
        </div>

        <button
          onClick={() => cargarCatalogo(selectedCategory, searchTerm)}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-noctis-card border border-noctis-surface hover:border-noctis-cyan text-xs font-medium text-noctis-text transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-noctis-cyan' : ''}`} />
          <span>Actualizar Catálogo</span>
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Selector Desplegable Flotante para Categorías */}
        <div className="w-full sm:w-64">
          <CustomSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Filtrar por categoría..."
          />
        </div>

        {/* Buscador de Producto */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre (ej: PS5, Xbox, Zelda)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-noctis-card border border-noctis-surface focus:border-noctis-cyan focus:outline-none focus:ring-1 focus:ring-noctis-cyan text-xs text-white placeholder-noctis-muted"
          />
          <Search className="w-4 h-4 text-noctis-muted absolute left-3.5 top-3" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                cargarCatalogo(selectedCategory, '');
              }}
              className="absolute right-3 top-2.5 text-noctis-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-noctis-card border border-noctis-surface/40 animate-pulse" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-noctis-card/40 border border-noctis-surface/40 max-w-lg mx-auto p-8 space-y-4">
          <Filter className="w-12 h-12 text-noctis-muted mx-auto" />
          <h3 className="font-poppins font-bold text-lg text-white">No se encontraron productos</h3>
          <p className="text-xs text-noctis-muted leading-relaxed font-sans">
            No hay resultados para los filtros seleccionados. Intenta restablecer la categoría o buscar otro término.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Todas');
              setSearchTerm('');
              cargarCatalogo('Todas', '');
            }}
            className="px-5 py-2.5 rounded-xl bg-noctis-purple text-white text-xs font-semibold hover:bg-noctis-purpleDark transition-colors font-sans"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              stock={stocks[producto.id]}
              onOpenDetails={(p) => setSelectedProductDetail(p)}
            />
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-noctis-card border border-noctis-surface p-6 sm:p-8 shadow-2xl space-y-6 font-sans">
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-noctis-surfaceDark text-noctis-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="h-60 rounded-2xl bg-gradient-to-b from-noctis-surfaceDark to-noctis-card flex items-center justify-center p-6 border border-noctis-surface/40">
                <Sparkles className="w-20 h-20 text-noctis-cyan/40" />
              </div>

              <div className="space-y-4">
                <span className="px-3 py-1 rounded-md bg-noctis-purple/20 text-noctis-purpleLight text-xs font-semibold uppercase">
                  {selectedProductDetail.categoria}
                </span>

                <h2 className="font-poppins font-bold text-2xl text-white">
                  {selectedProductDetail.nombre}
                </h2>

                <p className="text-xs text-noctis-muted leading-relaxed font-sans">
                  {selectedProductDetail.descripcion}
                </p>

                <div className="pt-2">
                  <span className="text-[10px] text-noctis-muted uppercase tracking-wider block">Precio oficial COP</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans font-extrabold text-3xl text-white">
                      {formatCOP(selectedProductDetail.precio)}
                    </span>
                    <span className="text-xs font-bold text-noctis-cyan">COP</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      addToCart(selectedProductDetail, 1);
                      setSelectedProductDetail(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-noctis-purple to-noctis-purpleDark hover:from-noctis-purpleLight text-white font-sans font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-purple transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Añadir al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
