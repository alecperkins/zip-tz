
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

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

function minify (header, code) {
  const result = UglifyJS.minify({ 'file1.js': code.toString() }, {
    mangle: true,
    toplevel: true,
    compress: {
      passes: 2,
    },
    output: {
      preamble: header,
    },
  });
  if (result.error) {
    throw result.error;
  }
  if (result.warnings) {
    result.warnings.forEach(warning => {
      console.warn(warning);
    });
  }
  return result.code;
}

function browserify (header, code) {
  return `${header}
;window.zipTZ = (function (exports) {
${ code }
exports["version"] = "${ package_content.version }";
Object.assign(zipTZ, exports);
return zipTZ;
})({});
`;
}

function libify (header, code) {
  return `${ header }
${ code }
Object.defineProperty(module.exports, "version", { value: "${ package_content.version }" });
Object.defineProperty(module.exports, "__esModule", { value: true });
Object.assign(zipTZ, exports);
module.exports = zipTZ;`;
}


const package_content = require(path.join(__dirname, '..', 'package.json'));
delete package_content.scripts;
delete package_content.devDependencies;
delete package_content.private;
delete package_content.engines;
const header = `/* ${ package_content.name }@${ package_content.version } ${ package_content.license } ${ package_content.homepage } */`;

prepareDir();

writePackageFile('package.json', JSON.stringify(package_content, null, 4));
writePackageFile('README.md', readProjectFile('README.md'));
writePackageFile('LICENSE', readProjectFile('LICENSE'));

let raw_cjs_content = readBuildFile('index.cjs').toString();
raw_cjs_content = raw_cjs_content.replace(`Object.defineProperty(exports, "__esModule", { value: true });`,'');
raw_cjs_content = raw_cjs_content.replace(`exports.default = zipTZ;`,'');


writePackageFile('index.mjs', `${ header }
${ readBuildFile('index.mjs') }
export const version = "${ package_content.version }";
`);
writePackageFile('index.cjs', libify(header, raw_cjs_content));
writePackageFile('index.d.ts', readBuildFile('index.d.ts'));

writePackageFile('zip-tz.js', browserify(header, raw_cjs_content));
writePackageFile('zip-tz.min.js', minify(header, browserify('', raw_cjs_content)));
