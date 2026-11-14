/**
 * Serialize the virtual iframe entry module source.
 * Imports the shared client bootstrap + the scanned view file (absolute path).
 */
export function serializeExtEntryModule(viewFilePath: string): string {
  return `import { mountExtensionView } from '@agentos/core/client';
import View from ${JSON.stringify(viewFilePath)};
mountExtensionView(View);
`;
}
