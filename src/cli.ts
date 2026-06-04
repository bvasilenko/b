import { runCli } from './cli-program.js';

runCli({
  argv: process.argv,
  cwd: process.cwd(),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  exit: process.exit,
});
