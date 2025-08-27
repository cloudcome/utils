import fs from 'node:fs';
import path from 'node:path';

const pkgJsonFile = path.resolve(process.cwd(), 'package.json');
const pkgJsonData = fs.readFileSync(pkgJsonFile, 'utf-8');
const pkgJson = JSON.parse(pkgJsonData);

fs.writeFileSync(`${pkgJsonFile}.bak`, pkgJsonData);

for (const key of ['scripts', 'devDependencies']) {
  delete pkgJson[key];
}

pkgJson.publishConfig = {
  access: 'public',
  registry: 'https://registry.npmjs.org',
};

fs.writeFileSync(pkgJsonFile, JSON.stringify(pkgJson, null, 2));
