// lib/events.ts
// Event bus simples (on/off/emit) sem precisar instalar 'mitt'

type Handler<Payload = any> = (payload?: Payload) => void;

class TinyEmitter<Events extends Record<string, any>> {
  private map = new Map<keyof Events, Set<Handler>>();

  on<K extends keyof Events>(type: K, handler: Handler<Events[K]>) {
    if (!this.map.has(type)) this.map.set(type, new Set());
    this.map.get(type)!.add(handler as Handler);
  }

  off<K extends keyof Events>(type: K, handler: Handler<Events[K]>) {
    this.map.get(type)?.delete(handler as Handler);
  }

  emit<K extends keyof Events>(type: K, payload?: Events[K]) {
    const set = this.map.get(type);
    if (!set) return;
    set.forEach((h) => {
      try { (h as Handler<Events[K]>)(payload); } catch {}
    });
  }
}

type AppEvents = {
  "history:refresh": void;
};

export const appEvents = new TinyEmitter<AppEvents>();
