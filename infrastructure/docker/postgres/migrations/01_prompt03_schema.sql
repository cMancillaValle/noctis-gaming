-- ===============================================================================
-- NOCTIS GAMING - MIGRACIÓN VERSIONADA 01 (PROMPT 03)
-- Esquema no destructivo e idempotente para soporte técnico, mensajería y roles
-- ===============================================================================

-- 1. BASE DE DATOS: clientes_db
-- Asegurar que la columna 'rol' exista sin afectar registros existentes
\connect clientes_db;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'rol'
    ) THEN
        ALTER TABLE clientes ADD COLUMN rol VARCHAR(50) DEFAULT 'CLIENTE' NOT NULL;
        RAISE NOTICE 'Columna rol agregada exitosamente a la tabla clientes';
    END IF;
END $$;

-- 2. BASE DE DATOS: ventas_db
-- Tablas persistentes para Solicitudes Técnicas y Mensajería Contextual
\connect ventas_db;

CREATE TABLE IF NOT EXISTS solicitudes_tecnicas (
    id BIGSERIAL PRIMARY KEY,
    numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_telefono VARCHAR(50) NOT NULL,
    cliente_email VARCHAR(150) NOT NULL,
    servicio_tipo VARCHAR(80) NOT NULL,
    dispositivo_tipo VARCHAR(80) NOT NULL,
    marca_modelo VARCHAR(150) NOT NULL,
    sintomas TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'RECIBIDA',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_cliente_id ON solicitudes_tecnicas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_tecnicas(estado);

CREATE TABLE IF NOT EXISTS conversaciones (
    id BIGSERIAL PRIMARY KEY,
    tipo_origen VARCHAR(30) NOT NULL,
    entidad_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    titulo_contexto VARCHAR(150) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_ultima_actividad TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_conversacion_origen_entidad UNIQUE (tipo_origen, entidad_id)
);

CREATE INDEX IF NOT EXISTS idx_conversaciones_cliente_id ON conversaciones(cliente_id);

CREATE TABLE IF NOT EXISTS mensajes (
    id BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL,
    remitente_id BIGINT NOT NULL,
    remitente_rol VARCHAR(30) NOT NULL,
    remitente_nombre VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    leido_por_admin BOOLEAN NOT NULL DEFAULT FALSE,
    leido_por_cliente BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_mensaje_conversacion FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion_id ON mensajes(conversacion_id);
