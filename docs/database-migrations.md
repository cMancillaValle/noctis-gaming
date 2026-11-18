# Migraciones de base de datos

Cada microservicio administra exclusivamente el esquema de su propia base lógica
mediante Flyway. Las migraciones están en `src/main/resources/db/migration` y
Hibernate valida el resultado con `ddl-auto: validate`; Hibernate no crea ni
modifica tablas.

## Bases vacías

Al iniciar un servicio contra una base vacía, Flyway crea
`flyway_schema_history`, ejecuta `V1` dentro de una transacción y después
Hibernate valida que el esquema coincide con las entidades JPA. Esto mantiene la
compatibilidad con Docker Compose: `init-databases.sql` crea las cinco bases y
cada servicio crea únicamente sus propias tablas.

## Bases existentes sin historial de Flyway

`baseline-on-migrate` está deshabilitado intencionalmente. Si una base contiene
tablas pero no tiene `flyway_schema_history`, el servicio debe detenerse en vez
de asumir que el esquema coincide y omitir `V1` silenciosamente.

Antes de adoptar Flyway en una base existente:

1. Hacer un respaldo y detener escrituras.
2. Comparar tablas, columnas, tipos, nulabilidad, índices y restricciones con
   la migración `V1` del servicio correspondiente.
3. Aplicar una migración de conciliación revisada si existe cualquier
   diferencia. No modificar una migración `V1` que ya se haya ejecutado.
4. Solo cuando el esquema sea equivalente, ejecutar un baseline explícito en
   versión `1` mediante una operación administrativa controlada.
5. Iniciar el servicio y comprobar `flyway validate` y la validación de Hibernate.

El script legado `infrastructure/docker/postgres/migrations/01_prompt03_schema.sql`
no forma parte de Flyway y no debe ejecutarse adicionalmente en una base creada
por las nuevas migraciones.

## Concurrencia en producción

Flyway usa su tabla de historial y bloqueo transaccional para que una sola
instancia aplique una versión mientras las demás esperan. Para el primer
despliegue se recomienda mantener una única réplica por servicio hasta confirmar
la migración. Las evoluciones largas o con transformación de datos deben
ejecutarse como un paso de migración controlado antes de aumentar réplicas.

`clean` está deshabilitado y las migraciones versionadas no contienen `DROP`,
`TRUNCATE` ni sentencias que reemplacen datos.
