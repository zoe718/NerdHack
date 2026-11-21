'use strict';
// KV mínimo: Valkey si USE_VALKEY=true, si no un Map + EventEmitter en memoria (tests, demo sin docker).
// Interfaz: set(k, v, {nx, ex}) → 'OK'|null · get · getdel · publish(canal, msg) · subscribe(canal, fn) → unsub
//           zadd(k, score, miembro) · zrangebyscore(k, min, max) · zrem(k, miembro) · close()
const { EventEmitter } = require('node:events');

function memoria() {
  const datos = new Map(); // k → { v, vence }
  const zsets = new Map(); // k → Map(miembro → score)
  const bus = new EventEmitter();
  bus.setMaxListeners(0);
  const vivo = (k) => {
    const e = datos.get(k);
    if (e && e.vence && e.vence <= Date.now()) { datos.delete(k); return undefined; }
    return e;
  };
  return {
    tipo: 'memoria',
    async set(k, v, { nx, ex } = {}) {
      if (nx && vivo(k)) return null;
      datos.set(k, { v: String(v), vence: ex ? Date.now() + ex * 1000 : 0 });
      return 'OK';
    },
    async get(k) { const e = vivo(k); return e ? e.v : null; },
    async getdel(k) { const e = vivo(k); datos.delete(k); return e ? e.v : null; },
    async publish(canal, msg) { bus.emit(canal, String(msg)); return bus.listenerCount(canal); },
    async subscribe(canal, fn) { bus.on(canal, fn); return async () => bus.off(canal, fn); },
    async zadd(k, score, m) { if (!zsets.has(k)) zsets.set(k, new Map()); zsets.get(k).set(String(m), Number(score)); return 1; },
    async zrangebyscore(k, min, max) {
      const z = zsets.get(k);
      if (!z) return [];
      const lo = min === '-inf' ? -Infinity : Number(min);
      const hi = max === '+inf' ? Infinity : Number(max);
      return [...z].filter(([, s]) => s >= lo && s <= hi).sort((a, b) => a[1] - b[1]).map(([m]) => m);
    },
    async zrem(k, m) { const z = zsets.get(k); return z && z.delete(String(m)) ? 1 : 0; },
    async close() { bus.removeAllListeners(); },
  };
}

function valkey(url) {
  const Valkey = require('iovalkey');
  const cli = new Valkey(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  let sub = null;
  const handlers = new Map(); // canal → Set(fn)
  function suscriptor() {
    if (sub) return sub;
    sub = cli.duplicate();
    sub.on('message', (canal, msg) => { for (const fn of handlers.get(canal) || []) fn(msg); });
    return sub;
  }
  return {
    tipo: 'valkey',
    async set(k, v, { nx, ex } = {}) {
      const args = [k, String(v)];
      if (ex) args.push('EX', ex);
      if (nx) args.push('NX');
      return cli.set(...args);
    },
    get: (k) => cli.get(k),
    getdel: (k) => cli.getdel(k),
    publish: (canal, msg) => cli.publish(canal, String(msg)),
    async subscribe(canal, fn) {
      const s = suscriptor();
      if (!handlers.has(canal)) { handlers.set(canal, new Set()); await s.subscribe(canal); }
      handlers.get(canal).add(fn);
      return async () => {
        const set = handlers.get(canal);
        if (!set) return;
        set.delete(fn);
        if (!set.size) { handlers.delete(canal); await s.unsubscribe(canal); }
      };
    },
    zadd: (k, score, m) => cli.zadd(k, score, String(m)),
    zrangebyscore: (k, min, max) => cli.zrangebyscore(k, min, max),
    zrem: (k, m) => cli.zrem(k, String(m)),
    async close() { if (sub) sub.disconnect(); cli.disconnect(); },
  };
}

function createKv({ useValkey = process.env.USE_VALKEY === 'true', url = process.env.VALKEY_URL || 'redis://localhost:6379' } = {}) {
  return useValkey ? valkey(url) : memoria();
}

module.exports = { createKv };
