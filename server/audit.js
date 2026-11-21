'use strict';
// Bitácora única: todo cambio relevante pasa por aquí. Nunca guardes tokens ni secretos en `detalle`.
function registrar(ctx, jornadaId, actor, accion, detalle) {
  ctx.repo.auditar(jornadaId, actor || 'sistema', accion, detalle || null, ctx.ts());
}
module.exports = { registrar };
