-- ============================================
-- Limpieza de sesiones que ya no sirven
--
-- La tabla crece una fila por cada login Y por cada renovación. Con un access
-- token de 15 minutos eso son unas 96 filas por usuario y día, y nada las borra:
-- sin esto la tabla solo sube.
--
-- No se ejecuta sola. Este archivo NO está en la carpeta que corre Postgres al
-- arrancar (public/db/), está aparte a propósito: hay que programarlo.
--
--   cron del servidor, una vez al día:
--     0 4 * * * docker exec erp_postgres psql -U erp_user -d erp -f /ruta/purge-sessions.sql
--
--   o a mano cuando haga falta:
--     docker exec -i erp_postgres psql -U erp_user -d erp < public/db/maintenance/purge-sessions.sql
--
-- Se borran solo las que llevan más de 30 días vencidas. El margen es para poder
-- investigar un incidente hacia atrás: las sesiones guardan IP, user agent y el
-- motivo de revocación, que es justo lo que se mira cuando se sospecha un robo
-- de token. Sube o baja ese número según cuánta memoria quieras conservar.
--
-- La cadena de rotación no estorba: replaced_by_session_id tiene ON DELETE SET
-- NULL, así que borrar una sesión deja a su predecesora sin puntero en lugar de
-- bloquear el borrado.
-- ============================================

DELETE FROM sessions
WHERE expires_at < now() - INTERVAL '30 days';
