import { useState, type SubmitEvent } from 'react';
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

export type AccountSecuritySectionProps = {
  busy?: boolean;
  onChangePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
};

export function AccountSecuritySection({
  busy = false,
  onChangePassword,
}: AccountSecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Current and new password are required');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onChangePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    } finally {
      setSaving(false);
    }
  }

  const disabled = busy || saving;

  return (
    <Card data-slot="account-security" size="sm">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Change your password while signed in</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-current-password">
                Current password
              </FieldLabel>
              <Input
                id="account-current-password"
                type="password"
                value={currentPassword}
                onValueChange={setCurrentPassword}
                disabled={disabled}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-new-password">
                New password
              </FieldLabel>
              <Input
                id="account-new-password"
                type="password"
                value={newPassword}
                onValueChange={setNewPassword}
                disabled={disabled}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-confirm-password">
                Confirm new password
              </FieldLabel>
              <Input
                id="account-confirm-password"
                type="password"
                value={confirm}
                onValueChange={setConfirm}
                disabled={disabled}
                autoComplete="new-password"
                required
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
            <Field>
              <Button type="submit" disabled={disabled}>
                {saving ? 'Updating…' : 'Change password'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
