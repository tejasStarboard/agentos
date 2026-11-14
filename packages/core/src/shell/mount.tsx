import { createRoot, type Root } from 'react-dom/client';
import { ShellRoot } from './components/shell-root';

let activeRoot: Root | null = null;

/** Mount the Core Shell workspace into `root`. */
export function mountShell(root: HTMLElement): void {
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  activeRoot = createRoot(root);
  activeRoot.render(<ShellRoot />);
}
