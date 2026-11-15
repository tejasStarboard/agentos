/** Line-prefix child process stdout/stderr for concurrent logs. */

export function prefixLine(name: string, line: string): string {
  return `[${name}] ${line}`;
}

/**
 * Pipe a ReadableStream of text chunks to a write fn, prefixing each line.
 * Incomplete trailing lines are held until a newline or stream end.
 */
export async function pipePrefixed(
  stream: ReadableStream<Uint8Array> | null | undefined,
  name: string,
  write: (line: string) => void,
): Promise<void> {
  if (!stream) return;

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? '';
      for (const part of parts) {
        write(prefixLine(name, part));
      }
    }
    buffer += decoder.decode();
    if (buffer.length > 0) {
      write(prefixLine(name, buffer));
    }
  } finally {
    reader.releaseLock();
  }
}

export function writeStdout(line: string): void {
  console.log(line);
}

export function writeStderr(line: string): void {
  console.error(line);
}
