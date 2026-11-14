import { describe, expect, test } from 'bun:test';
import * as Comlink from 'comlink';
import {
  HANDSHAKE,
  type ExtensionAPI,
  type ExtensionContentWindow,
  type HandshakeIncomingMessage,
  type HandshakeMessageTarget,
} from '@agentos/core/sdk';
import {
  activateFrame,
  createShellHostApi,
  deactivateFrame,
  resetShellHostApiStorage,
} from '@agentos/core/shell/lib';

type MessageListener = (event: HandshakeIncomingMessage) => void;

interface FakeParentWindow extends HandshakeMessageTarget {
  postMessage(
    data: HandshakeIncomingMessage['data'],
    origin?: string,
    transfer?: Transferable[],
  ): void;
}

interface FakeChildWindow extends ExtensionContentWindow {
  parent: FakeParentWindow;
  addEventListener(type: 'message', listener: MessageListener): void;
  removeEventListener(type: 'message', listener: MessageListener): void;
}

function createLinkedWindows(): {
  parent: FakeParentWindow;
  child: FakeChildWindow;
} {
  const parentListeners = new Set<MessageListener>();
  const childListeners = new Set<MessageListener>();

  const portsOf = (transfer?: Transferable[]): MessagePort[] =>
    (transfer ?? []).filter((t): t is MessagePort => t instanceof MessagePort);

  const pair: {
    parent?: FakeParentWindow;
    child?: FakeChildWindow;
  } = {};

  pair.parent = {
    setTimeout: (handler, timeout) => globalThis.setTimeout(handler, timeout),
    clearTimeout: (id) => {
      globalThis.clearTimeout(id);
    },
    addEventListener(type, listener) {
      if (type === 'message') parentListeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === 'message') parentListeners.delete(listener);
    },
    postMessage(data, _origin, transfer) {
      const event: HandshakeIncomingMessage = {
        data,
        source: pair.child!,
        ports: portsOf(transfer),
      };
      for (const listener of parentListeners) listener(event);
    },
  };

  pair.child = {
    parent: pair.parent,
    addEventListener(type, listener) {
      if (type === 'message') childListeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === 'message') childListeners.delete(listener);
    },
    postMessage(message, _origin, transfer) {
      const event: HandshakeIncomingMessage = {
        data: message,
        source: pair.parent!,
        ports: portsOf(transfer),
      };
      for (const listener of childListeners) listener(event);
    },
  };

  return { parent: pair.parent, child: pair.child };
}

function wireExtensionChild(
  parent: FakeParentWindow,
  child: FakeChildWindow,
  api: ExtensionAPI,
): void {
  child.addEventListener('message', (event) => {
    if (
      !event.data ||
      typeof event.data !== 'object' ||
      !('type' in event.data) ||
      event.data.type !== HANDSHAKE.HOST_ACK
    ) {
      return;
    }
    const [, extensionPort] = event.ports;
    if (!extensionPort) return;
    Comlink.expose(api, extensionPort);
    parent.postMessage({ type: HANDSHAKE.PORT_READY });
  });
}

describe('extension-runtime', () => {
  test('activateFrame completes READY → handshake → onActivate', async () => {
    resetShellHostApiStorage();
    const { parent, child } = createLinkedWindows();
    const activated: string[] = [];

    wireExtensionChild(parent, child, {
      onActivate: async () => {
        activated.push('on');
      },
      onDeactivate: async () => {},
      onEvent: async () => {},
    });

    const pending = activateFrame({
      extensionId: 'ext-a',
      contentWindow: child,
      hostApi: createShellHostApi('ext-a'),
      messageTarget: parent,
      handshakeTimeoutMs: 2000,
      rpcTimeoutMs: 2000,
    });

    parent.postMessage({ type: HANDSHAKE.READY });

    const frame = await pending;
    expect(activated).toEqual(['on']);

    const result = await deactivateFrame(
      'ext-a',
      frame.remote,
      frame.dispose,
      2000,
    );
    expect(result.ok).toBe(true);
  });

  test('activateFrame marks failure when onActivate times out', async () => {
    resetShellHostApiStorage();
    const { parent, child } = createLinkedWindows();

    wireExtensionChild(parent, child, {
      onActivate: async () => {
        await new Promise((r) => setTimeout(r, 200));
      },
      onDeactivate: async () => {},
      onEvent: async () => {},
    });

    const pending = activateFrame({
      extensionId: 'ext-slow',
      contentWindow: child,
      hostApi: createShellHostApi('ext-slow'),
      messageTarget: parent,
      handshakeTimeoutMs: 2000,
      rpcTimeoutMs: 20,
    });

    parent.postMessage({ type: HANDSHAKE.READY });

    await expect(pending).rejects.toThrow(/timed out on onActivate/);
  });

  test('deactivateFrame calls onDeactivate then dispose', async () => {
    resetShellHostApiStorage();
    const { parent, child } = createLinkedWindows();
    const log: string[] = [];

    wireExtensionChild(parent, child, {
      onActivate: async () => {
        log.push('activate');
      },
      onDeactivate: async () => {
        log.push('deactivate');
      },
      onEvent: async () => {},
    });

    const pending = activateFrame({
      extensionId: 'ext-b',
      contentWindow: child,
      hostApi: createShellHostApi('ext-b'),
      messageTarget: parent,
      handshakeTimeoutMs: 2000,
    });
    parent.postMessage({ type: HANDSHAKE.READY });
    const frame = await pending;

    let disposed = false;
    const result = await deactivateFrame('ext-b', frame.remote, () => {
      disposed = true;
      frame.dispose();
    });

    expect(result.ok).toBe(true);
    expect(log).toEqual(['activate', 'deactivate']);
    expect(disposed).toBe(true);
  });
});
