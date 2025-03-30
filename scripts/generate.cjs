const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const srcDir = path.resolve(root, 'src');

const exclude = ['index.ts', 'dts'];
const files = fs.readdirSync(srcDir).filter((file) => !exclude.includes(file));
/**
 * @type {{name: string; path: string;}[]}
 */
const expose = [];

for (const file of files) {
  const filePath = path.resolve(srcDir, file);
  const isFolder = fs.statSync(filePath).isDirectory();

  expose.push({
    name: isFolder ? file : file.replace(/\.ts$/, ''),
    path: isFolder ? `${file}/index.ts` : file,
  });
}

console.log(expose);

/**
 * 替换 vite.config.ts 中的 expose
 */
const replaceViteConfig = () => {
  const fileName = 'vite.config.mts';
  const filePath = path.resolve(root, fileName);
  const exposeObj = {
    index: 'src/index.ts',
  };

  for (const { name, path } of expose) {
    exposeObj[name] = `./src/${path}`;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const replaced = content.replace(
    /(^\s+\/\/ expose-start)[\s\S]*?(^\s+\/\/ expose-end)/m,
    `$1\n${JSON.stringify(exposeObj, null, 2)}\n$2`,
  );
  fs.writeFileSync(filePath, replaced);
  // console.log(replaced);
  console.log(`${fileName} replaced`);
};

const replacePackageJson = () => {
  const fileName = 'package.json';
  const filePath = path.resolve(root, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const pkg = JSON.parse(content);

  pkg.exports = {
    '.': {
      import: './dist/index.mjs',
      require: './dist/index.cjs',
      types: './dist/index.d.ts',
    },
    './package.json': './package.json',
  };
  const typesVersions = {};
  pkg.typesVersions = {
    '*': typesVersions,
  };

  for (const { name } of expose) {
    pkg.exports[`./${name}`] = {
      import: `./dist/${name}.mjs`,
      require: `./dist/${name}.cjs`,
      types: `./dist/${name}.d.ts`,
    };
    typesVersions[name] = [`./dist/${name}.d.ts`];
  }

  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
  console.log(`${fileName} replaced`);
};

replaceViteConfig();
replacePackageJson();
