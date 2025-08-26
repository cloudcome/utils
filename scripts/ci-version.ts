import { execSync } from 'node:child_process';
import pkg from '../package.json';

const firstVersion = process.argv.slice(2)[0] === '--first-version=true';
const bump = firstVersion ? `${pkg.version}` : '';

// https://github.com/lerna/lerna/tree/main/libs/commands/version
run(`npx lerna version ${bump} --yes --create-release=github`);

function run(command: string) {
  console.log('>', command);
  execSync(command, { stdio: 'inherit' });
}
