
const fs = require('fs');
const path = require('path');


const PROJECT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(PROJECT_DIR, 'build');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');

function readProjectFile (filepath) {
  return fs.readFileSync(path.join(PROJECT_DIR, filepath));
}
function readBuildFile (filepath) {
  return fs.readFileSync(path.join(BUILD_DIR, filepath));
}


function prepareDir () {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR);
}

function writePackageFile (name, content) {
  console.log('writing',name);
  fs.writeFileSync(
    path.join(DIST_DIR, name),
    content,
  );
}

const package_content = require(path.join(__dirname, '..', 'package.json'));
delete package_content.scripts;
delete package_content.devDependencies;
delete package_content.private;
delete package_content.engines;

prepareDir();

writePackageFile('package.json', JSON.stringify(package_content, null, 4));
writePackageFile('README.md', readProjectFile('README.md'));
writePackageFile('LICENSE', readProjectFile('LICENSE'));

let cjs_content = readBuildFile('index.cjs').toString();
cjs_content = cjs_content.replace(`Object.defineProperty(exports, "__esModule", { value: true });`,'');
cjs_content = cjs_content.replace(`exports.default = zipTZ;`,`
module.exports = zipTZ;
module.exports.default = zipTZ;
Object.defineProperty(module.exports, "__esModule", { value: true });
`);


writePackageFile('index.mjs', readBuildFile('index.mjs'));
writePackageFile('index.cjs', cjs_content);
writePackageFile('index.d.ts', readBuildFile('index.d.ts'));
