import * as Comlink from 'comlink';
import {
  fromDomMessageEvent,
  toError,
  type CatchValue,
  type ExtensionContentWindow,
  type HandshakeIncomingMessage,
  type HandshakeMessageTarget,
} from './contracts';
import { HANDSHAKE, isHandshakeType } from './handshake';
import { proxyHostApi } from './proxy';
import {
  HandshakeTimeoutError,
  type ExtensionAPI,
  type HostAPI,
} from './types';

export interface ConnectExtensionHostOptions {
  /** `iframe.contentWindow` of the extension frame. */
  contentWindow: ExtensionContentWindow;
  /** Host API implementation; nested namespaces are proxied automatically. */
  hostApi: HostAPI;
  /** Milliseconds to wait for PORT_READY before rejecting. */
  handshakeTimeoutMs?: number;
  /**
   * Window that receives PORT_READY (defaults to shell `window`).
   * Overridable for tests via HandshakeMessageTarget.
   */
  messageTarget?: HandshakeMessageTarget;
}

export interface ExtensionHostConnection {
  remote: Comlink.Remote<ExtensionAPI>;
  dispose: () => void;
}

const domListenerMap = new WeakMap<
  (event: HandshakeIncomingMessage) => void,
  (event: MessageEvent) => void
>();

function toHandshakeMessageTarget(
  target: Window & typeof globalThis,
): HandshakeMessageTarget {
  return {
    // Use globalThis timers so DOM `Window.setTimeout` (number) and Bun
    // (`Timeout`) stay aligned with HandshakeTimerId under `@types/bun`.
    setTimeout: (handler, timeout) => globalThis.setTimeout(handler, timeout),
    clearTimeout: (id) => globalThis.clearTimeout(id),
    addEventListener: (type, listener) => {
      const domListener = (event: MessageEvent) => {
        listener(fromDomMessageEvent(event));
      };
      domListenerMap.set(listener, domListener);
      target.addEventListener(type, domListener);
    },
    removeEventListener: (type, listener) => {
      const domListener = domListenerMap.get(listener);
      if (domListener) {
        target.removeEventListener(type, domListener);
        domListenerMap.delete(listener);
      }
    },
  };
}

/**
 * Completes the host side of the dual MessageChannel handshake.
 *
 * Call when the shell receives `HANDSHAKE.READY` from `contentWindow`.
 * Transfers `[hostPort2, extPort2]` with `HOST_ACK`, then waits for `PORT_READY`.
 */
export async function connectExtensionHost(
  options: ConnectExtensionHostOptions,
): Promise<ExtensionHostConnection> {
  const {
    contentWindow,
    hostApi,
    handshakeTimeoutMs = 10_000,
    messageTarget = toHandshakeMessageTarget(
      globalThis as Window & typeof globalThis,
    ),
  } = options;

  const hostChannel = new MessageChannel();
  const extChannel = new MessageChannel();

  const proxied = proxyHostApi(hostApi);
  Comlink.expose(proxied, hostChannel.port1);
  const remote = Comlink.wrap<ExtensionAPI>(extChannel.port1);

  const dispose = () => {
    try {
      remote[Comlink.releaseProxy]();
    } catch {
      /* already released */
    }
    try {
      hostChannel.port1.close();
      extChannel.port1.close();
    } catch {
      /* already closed */
    }
  };

  const portReady = new Promise<void>((resolve, reject) => {
    const timer = messageTarget.setTimeout(() => {
      cleanup();
      reject(new HandshakeTimeoutError('host', handshakeTimeoutMs));
    }, handshakeTimeoutMs);

    const onMessage = (event: HandshakeIncomingMessage) => {
      if (event.source !== contentWindow) return;
      if (!isHandshakeType(event.data, HANDSHAKE.PORT_READY)) return;
      cleanup();
      resolve();
    };

    const cleanup = () => {
      messageTarget.clearTimeout(timer);
      messageTarget.removeEventListener('message', onMessage);
    };

    messageTarget.addEventListener('message', onMessage);
  });

  contentWindow.postMessage({ type: HANDSHAKE.HOST_ACK }, '*', [
    hostChannel.port2,
    extChannel.port2,
  ]);

  try {
    await portReady;
  } catch (error) {
    dispose();
    throw toError(error as CatchValue);
  }

  return { remote, dispose };
}
