import { useState, type FormEvent } from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@agentos/ui/components/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@agentos/ui/components/input-group';
import { Kbd } from '@agentos/ui/components/kbd';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { navigateApp } from '@agentos/core/shell/lib';
import { AuthPublicLayout } from './auth-public-layout';

export type NotFoundPageBranding = {
  appName: string;
  logoUrl?: string;
};

export type NotFoundPageProps = {
  branding?: NotFoundPageBranding;
};

/**
 * SPA Not Found surface for unknown browser paths (outside Shell chrome).
 * Composition follows shadcn Empty + InputGroup 404 example.
 */
export function NotFoundPage({
  branding = { appName: 'AgentOS' },
}: NotFoundPageProps) {
  const [query, setQuery] = useState('');

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No SPA search index yet — return to Home (known workspace path).
    navigateApp('/');
  }

  return (
    <AuthPublicLayout>
      <Empty className="border border-dashed" data-agentos-not-found>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MagnifyingGlassIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist in{' '}
            {branding.appName}. Try searching for what you need below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <form className="w-full" onSubmit={onSearchSubmit}>
            <InputGroup className="sm:w-3/4 mx-auto">
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try searching for pages..."
                aria-label="Search pages"
              />
              <InputGroupAddon>
                <MagnifyingGlassIcon />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <Kbd>/</Kbd>
              </InputGroupAddon>
            </InputGroup>
          </form>
          <EmptyDescription>
            Need help?{' '}
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                navigateApp('/');
              }}
            >
              Go home
            </a>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </AuthPublicLayout>
  );
}
