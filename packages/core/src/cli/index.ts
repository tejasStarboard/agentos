#!/usr/bin/env bun
import { main } from './lib/run';

const exitCode = await main();
if (exitCode !== 0) {
  process.exit(exitCode);
}
