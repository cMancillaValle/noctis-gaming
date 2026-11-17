import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Wrench, Truck, Headphones, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070A12] border-t border-noctis-surface/40 text-noctis-text/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/imagotipo-noctis.png"
                alt="Noctis Gaming"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-noctis-muted leading-relaxed max-w-sm">
              Plataforma líder en hardware, consolas de última generación y periféricos de alto rendimiento para la comunidad gamer en Colombia. Diseñado con arquitectura resiliente y servicio técnico especializado.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-noctis-cyan">
              <Sparkles className="w-4 h-4 text-noctis-cyan" />
              <span className="font-medium">Potenciado por microservicios Spring Boot & Azure Ready</span>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-poppins text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Catálogo Gamer
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalogo?categoria=Consolas" className="hover:text-noctis-cyan transition-colors">
                  Consolas de Última Gen
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Controles" className="hover:text-noctis-cyan transition-colors">
                  Controles Pro & Modding
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Videojuegos" className="hover:text-noctis-cyan transition-colors">
                  Títulos Exclusivos
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Periféricos" className="hover:text-noctis-cyan transition-colors">
                  Periféricos Competitivos
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=Accesorios" className="hover:text-noctis-cyan transition-colors">
                  Accesorios & Stands RGB
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicios de Mantenimiento */}
          <div>
            <h4 className="font-poppins text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Mantenimiento
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-noctis-muted">
                <Wrench className="w-3.5 h-3.5 text-noctis-purpleLight" />
                <span>Limpieza térmica consolas</span>
              </li>
              <li className="flex items-center gap-2 text-noctis-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-noctis-purpleLight" />
                <span>Calibración Hall Effect</span>
              </li>
              <li className="flex items-center gap-2 text-noctis-muted">
                <Headphones className="w-3.5 h-3.5 text-noctis-purpleLight" />
                <span>Diagnóstico de periféricos</span>
              </li>
              <li className="flex items-center gap-2 text-noctis-muted">
                <Truck className="w-3.5 h-3.5 text-noctis-purpleLight" />
                <span>Garantía Noctis Care</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-poppins text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-noctis-muted">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-noctis-cyan shrink-0 mt-0.5" />
                <span>Cra 15 # 85-30, Bogotá D.C., Colombia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-noctis-cyan shrink-0" />
                <span>+57 (601) 789 0123</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-noctis-cyan shrink-0" />
                <span>contacto@noctisgaming.co</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-noctis-surface/30 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-noctis-muted gap-4">
          <p>© 2026 Noctis Gaming. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Precios en Pesos Colombianos (COP)</span>
            <span className="text-noctis-cyan font-mono">Microservicios v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
