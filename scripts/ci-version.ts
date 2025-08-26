#!/usr/bin/env zx

import { $ } from 'zx';
import pkg from '../package.json';

const firstVersion = process.argv.slice(2)[0] === '--first-version=true';
const bump = firstVersion ? pkg.version : '';

// https://github.com/lerna/lerna/tree/main/libs/commands/version
// const command = `npx lerna version ${bump} --yes --create-release=github`;
const command = `npx lerna version ${bump} --yes --no-push`;
console.log(command);
await $`${command}`;
