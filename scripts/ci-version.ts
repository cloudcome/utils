#!/usr/bin/env zx

import { $, echo } from 'zx';
import pkg from '../package.json';

const firstVersion = process.argv.slice(2)[0] === '--first-version=true';
const bump = firstVersion ? ` ${pkg.version}` : '';

// https://github.com/lerna/lerna/tree/main/libs/commands/version
echo(`npx lerna version${bump} --yes --create-release=github`);
await $`npx lerna version${bump} --yes --create-release=github`;
