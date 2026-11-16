import { useState } from 'react';
import { PaperPlaneTiltIcon, XIcon } from '@phosphor-icons/react';
import { useShellStore } from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import { Input } from '@agentos/ui/components/input';
import { ScrollArea } from '@agentos/ui/components/scroll-area';

let messageSeq = 0;
function nextId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

/** Minimal Shell chat chrome → `POST /api/agent/chat` (builtin ai). */
export function ChatPanel() {
  const open = useShellStore((s) => s.chatOpen);
  const busy = useShellStore((s) => s.chatBusy);
  const messages = useShellStore((s) => s.chatMessages);
  const setChatOpen = useShellStore((s) => s.setChatOpen);
  const appendChatMessage = useShellStore((s) => s.appendChatMessage);
  const setChatBusy = useShellStore((s) => s.setChatBusy);
  const [draft, setDraft] = useState('');

  if (!open) return null;

  async function send() {
    const prompt = draft.trim();
    if (!prompt || busy) return;
    setDraft('');
    appendChatMessage({ id: nextId('user'), role: 'user', text: prompt });
    setChatBusy(true);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        text?: string;
        error?: string;
      };
      const text = res.ok
        ? (body.text ?? '')
        : (body.error ?? `Chat failed (${res.status})`);
      appendChatMessage({
        id: nextId('assistant'),
        role: 'assistant',
        text,
      });
    } catch (error) {
      appendChatMessage({
        id: nextId('assistant'),
        role: 'assistant',
        text: error instanceof Error ? error.message : 'Chat failed',
      });
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <aside
      className="absolute bottom-8 right-3 z-40 flex h-[min(420px,70vh)] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg"
      data-slot="chat-panel"
      aria-label="Shell chat"
    >
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">Chat</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close chat"
          onClick={() => setChatOpen(false)}
        >
          <XIcon className="size-4" />
        </Button>
      </header>
      <ScrollArea className="min-h-0 flex-1 px-3 py-2">
        <div className="flex flex-col gap-2">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Ask the platform AI. Extension instructions and tools are composed
              by the builtin ai runtime.
            </p>
          ) : null}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === 'user'
                  ? 'self-end rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground'
                  : 'self-start rounded-md bg-muted px-2.5 py-1.5 text-xs text-foreground'
              }
              data-role={msg.role}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form
        className="flex items-center gap-2 border-t border-border p-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message…"
          aria-label="Chat message"
          disabled={busy}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={busy || draft.trim().length === 0}
        >
          <PaperPlaneTiltIcon className="size-4" />
        </Button>
      </form>
    </aside>
  );
}
