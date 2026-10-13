import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(
  packageRoot,
  process.argv[2] ?? 'dist-scalprum',
);
const manifestPath = join(outputDir, 'plugin-manifest.json');

function fail(message) {
  console.error(`Dynamic plugin export validation failed: ${message}`);
  process.exit(1);
}

function requireFile(path, description) {
  if (!existsSync(path)) {
    fail(`${description} not found: ${path}`);
  }
}

requireFile(manifestPath, 'Scalprum plugin manifest');

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  fail(`could not parse ${manifestPath}: ${error.message}`);
}

if (manifest.name !== 'internal.plugin-translations-pt') {
  fail(`unexpected plugin name "${manifest.name}"`);
}

if (!Array.isArray(manifest.loadScripts) || manifest.loadScripts.length === 0) {
  fail('manifest must declare at least one load script');
}

for (const script of manifest.loadScripts) {
  const scriptPath = resolve(outputDir, script);
  if (!scriptPath.startsWith(`${outputDir}${sep}`)) {
    fail(`manifest load script escapes the export directory: ${script}`);
  }
  requireFile(scriptPath, `manifest load script "${script}"`);
}

const staticDir = join(outputDir, 'static');
requireFile(staticDir, 'Scalprum static assets directory');
const assets = readdirSync(staticDir).filter(file => file.endsWith('.js'));

for (const moduleName of ['PluginRoot', 'Alpha']) {
  if (!assets.some(file => file.startsWith(`exposed-${moduleName}.`))) {
    fail(`exposed ${moduleName} module bundle not found`);
  }
}

const alphaBundle = assets.find(file => file.startsWith('exposed-Alpha.'));
const alphaSource = readFileSync(join(staticDir, alphaBundle), 'utf8');
for (const resource of [
  'catalogTranslationsPT',
  'catalogReactTranslationsPT',
  'coreComponentsTranslationsPT',
]) {
  if (!alphaSource.includes(resource)) {
    fail(`Alpha bundle does not expose ${resource}`);
  }
}

const hasPortugueseCatalogMessage = assets.some(file =>
  readFileSync(join(staticDir, file), 'utf8').includes('Catálogo de'),
);
if (!hasPortugueseCatalogMessage) {
  fail('Portuguese Catalog messages were not found in the emitted assets');
}

console.log(
  `Validated ${manifest.name}: manifest, load scripts, exposed modules, ` +
    'Catalog translation resources, and pt-BR messages are present.',
);
