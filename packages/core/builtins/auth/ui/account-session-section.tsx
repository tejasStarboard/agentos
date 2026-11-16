import { Button } from '@agentos/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';

export type AccountSessionSectionProps = {
  busy?: boolean;
  onSignOut: () => void | Promise<void>;
};

export function AccountSessionSection({
  busy = false,
  onSignOut,
}: AccountSessionSectionProps) {
  return (
    <Card data-slot="account-session" size="sm">
      <CardHeader>
        <CardTitle>Session</CardTitle>
        <CardDescription>Sign out of this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void onSignOut()}
        >
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
