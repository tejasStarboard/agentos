import { isPlainObject, type WireMessageData } from './contracts';

/** Handshake message types used during client ↔ host boot (ADR 005). */
export const HANDSHAKE = {
  READY: 'extension:ready',
  HOST_ACK: 'host:ack',
  /** Child → parent after the transferred MessageChannel ports are wired. */
  PORT_READY: 'extension:port-ready',
} as const;

export type HandshakeType = (typeof HANDSHAKE)[keyof typeof HANDSHAKE];

export interface HandshakeMessage {
  type: HandshakeType;
}

function isHandshakeTypeValue(value: string): value is HandshakeType {
  return (
    value === HANDSHAKE.READY ||
    value === HANDSHAKE.HOST_ACK ||
    value === HANDSHAKE.PORT_READY
  );
}

export function isHandshakeMessage(
  data: WireMessageData,
): data is HandshakeMessage {
  if (!isPlainObject(data)) return false;
  const type = data.type;
  return typeof type === 'string' && isHandshakeTypeValue(type);
}

export function isHandshakeType(
  data: WireMessageData,
  expected: HandshakeType,
): boolean {
  return isHandshakeMessage(data) && data.type === expected;
}
