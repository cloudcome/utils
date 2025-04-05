import fs from "node:fs";
import path from "node:path";

export function generate(root = process.cwd()) {
	const srcDir = path.resolve(root, "src");

	const exclude = ["index.ts", "dts"];
	const files = fs
		.readdirSync(srcDir)
		.filter((file) => !exclude.includes(file));
	const expose: { name: string; path: string }[] = [];

	for (const file of files) {
		const filePath = path.resolve(srcDir, file);
		const isFolder = fs.statSync(filePath).isDirectory();

		expose.push({
			name: isFolder ? file : file.replace(/\.ts$/, ""),
			path: isFolder ? `${file}/index.ts` : file,
		});
	}

	console.log(expose);

	/**
	 * 替换 vite.config.ts 中的 expose
	 */
	const replaceViteConfig = () => {
		const fileName = "vite.config.mts";
		const filePath = path.resolve(root, fileName);
		const exposeObj: Record<string, string> = {
			index: "src/index.ts",
		};

		for (const { name, path } of expose) {
			exposeObj[name] = `./src/${path}`;
		}

		const content = fs.readFileSync(filePath, "utf-8");
		const replaced = content.replace(
			/(^\s+\/\/ expose-start)[\s\S]*?(^\s+\/\/ expose-end)/m,
			`$1\n${JSON.stringify(exposeObj, null, 2)}\n$2`,
		);
		fs.writeFileSync(filePath, replaced);
		// console.log(replaced);
		console.log(`${fileName} replaced`);
	};

	const replacePackageJson = () => {
		const fileName = "package.json";
		const filePath = path.resolve(root, fileName);
		const content = fs.readFileSync(filePath, "utf-8");
		const pkg = JSON.parse(content);

		pkg.exports = {
			".": {
				types: "./dist/index.d.ts",
				import: "./dist/index.mjs",
				require: "./dist/index.cjs",
			},
			"./package.json": "./package.json",
		};
		const typesVersions: Record<string, string[]> = {};
		pkg.typesVersions = {
			"*": typesVersions,
		};

		for (const { name } of expose) {
			pkg.exports[`./${name}`] = {
				types: `./dist/${name}.d.ts`,
				import: `./dist/${name}.mjs`,
				require: `./dist/${name}.cjs`,
			};
			typesVersions[name] = [`./dist/${name}.d.ts`];
		}

		fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
		console.log(`${fileName} replaced`);
	};

	replaceViteConfig();
	replacePackageJson();
}
