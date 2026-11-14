import { describe, expect, test } from 'bun:test';
import {
  HANDSHAKE,
  isHandshakeMessage,
  isHandshakeType,
} from '@agentos/core/sdk';

describe('handshake guards', () => {
  test('HANDSHAKE constants match ADR sequence names', () => {
    expect(HANDSHAKE.READY).toBe('extension:ready');
    expect(HANDSHAKE.HOST_ACK).toBe('host:ack');
    expect(HANDSHAKE.PORT_READY).toBe('extension:port-ready');
  });

  test('isHandshakeMessage accepts known types only', () => {
    expect(isHandshakeMessage({ type: HANDSHAKE.READY })).toBe(true);
    expect(isHandshakeMessage({ type: HANDSHAKE.HOST_ACK })).toBe(true);
    expect(isHandshakeMessage({ type: HANDSHAKE.PORT_READY })).toBe(true);
    expect(isHandshakeMessage({ type: 'nope' })).toBe(false);
    expect(isHandshakeMessage(null)).toBe(false);
    expect(isHandshakeMessage('ready')).toBe(false);
  });

  test('isHandshakeType checks exact type', () => {
    expect(isHandshakeType({ type: HANDSHAKE.READY }, HANDSHAKE.READY)).toBe(
      true,
    );
    expect(isHandshakeType({ type: HANDSHAKE.READY }, HANDSHAKE.HOST_ACK)).toBe(
      false,
    );
  });
});
