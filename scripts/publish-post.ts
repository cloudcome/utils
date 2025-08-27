import fs from 'node:fs';
import path from 'node:path';

const pkgJsonBackFile = path.resolve(process.cwd(), 'package.json.bak');

if (fs.existsSync(pkgJsonBackFile)) {
  fs.renameSync(pkgJsonBackFile, path.resolve(process.cwd(), 'package.json'));
}
