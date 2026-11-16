import { Badge } from '@agentos/ui/components/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';

/** Demo Home card — mounts on Home when this extension is enabled. */
export default function Widget() {
  return (
    <Card
      size="sm"
      className="h-full border-0 bg-transparent shadow-none"
      data-demo-widget
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Demo</CardTitle>
          <Badge variant="secondary">sample</Badge>
        </div>
        <CardDescription>
          Sample extension widget on the Home dashboard.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
