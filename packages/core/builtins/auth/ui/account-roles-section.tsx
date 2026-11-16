import { Badge } from '@agentos/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';

export type AccountRolesSectionProps = {
  roles: string[];
};

export function AccountRolesSection({ roles }: AccountRolesSectionProps) {
  return (
    <Card data-slot="account-roles" size="sm">
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>Assigned via Auth RBAC</CardDescription>
      </CardHeader>
      <CardContent>
        {roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No roles assigned</p>
        )}
      </CardContent>
    </Card>
  );
}
