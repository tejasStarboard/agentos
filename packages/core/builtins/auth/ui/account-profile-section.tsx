import { useEffect, useState, type SubmitEvent } from 'react';
import { Button } from '@agentos/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@agentos/ui/components/field';
import { Input } from '@agentos/ui/components/input';

export type AccountProfileSectionProps = {
  email: string;
  name: string;
  busy?: boolean;
  onSaveName: (name: string) => Promise<void>;
};

export function AccountProfileSection({
  email,
  name,
  busy = false,
  onSaveName,
}: AccountProfileSectionProps) {
  const [draftName, setDraftName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftName(name);
  }, [name]);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draftName.trim();
    if (!next) {
      setError('Name is required');
      return;
    }
    if (next === name) {
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSaveName(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setSaving(false);
    }
  }

  const disabled = busy || saving;

  return (
    <Card data-slot="account-profile" size="sm">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account identity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <Input
                id="account-email"
                type="email"
                value={email}
                disabled
                readOnly
                autoComplete="username"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-name">Display name</FieldLabel>
              <Input
                id="account-name"
                type="text"
                value={draftName}
                onValueChange={setDraftName}
                disabled={disabled}
                autoComplete="name"
                required
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
            <Field>
              <Button type="submit" disabled={disabled}>
                {saving ? 'Saving…' : 'Save name'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
