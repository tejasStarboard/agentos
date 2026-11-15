export type EventMessage = {
  topic: string;
  payload: unknown;
  at: string;
};

type Subscriber = {
  topics: Set<string> | null;
  enqueue: (msg: EventMessage) => void;
  close: () => void;
};

/** In-process pub/sub bus for SSE subscribers. */
export function createEventBus() {
  const subscribers = new Set<Subscriber>();

  return {
    publish(topic: string, payload: unknown): EventMessage {
      const msg: EventMessage = {
        topic,
        payload,
        at: new Date().toISOString(),
      };
      for (const sub of subscribers) {
        if (sub.topics === null || sub.topics.has(topic)) {
          sub.enqueue(msg);
        }
      }
      return msg;
    },

    subscribe(topics: string[] | null): {
      stream: ReadableStream<Uint8Array>;
      close: () => void;
    } {
      const encoder = new TextEncoder();
      let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
      let closed = false;

      const sub: Subscriber = {
        topics: topics && topics.length > 0 ? new Set(topics) : null,
        enqueue(msg) {
          if (!controller || closed) return;
          const data = `event: message\ndata: ${JSON.stringify(msg)}\n\n`;
          controller.enqueue(encoder.encode(data));
        },
        close() {
          if (closed) return;
          closed = true;
          subscribers.delete(sub);
          try {
            controller?.close();
          } catch {
            // already closed
          }
        },
      };

      const stream = new ReadableStream<Uint8Array>({
        start(c) {
          controller = c;
          subscribers.add(sub);
          c.enqueue(encoder.encode(': ok\n\n'));
        },
        cancel() {
          sub.close();
        },
      });

      return { stream, close: () => sub.close() };
    },

    get subscriberCount() {
      return subscribers.size;
    },
  };
}

export type EventBus = ReturnType<typeof createEventBus>;
