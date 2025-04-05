#!/usr/bin/env node

const { generate } = require('../dist/index.cjs');

const command = process.argv.slice(2)[0];

if (!command) {
  console.error('No command specified');
  process.exit(1);
}

console.log(`Running ${command}`);

if (command === 'generate') generate();
