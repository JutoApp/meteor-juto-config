const fs = Npm.require("fs");
const path = Npm.require("path");

// try to obtain package metadata from package.json ; it's much easier to manage the version number this way
// TODO: try to find a better way to obtain package metadata from package.json ; currently relying on a non-public _packageSource
const packageJSON = JSON.parse(fs.readFileSync(path.join(Package._packageSource.sourceRoot, "package.json")));
const { description, version, repository, readme } = packageJSON;

Package.describe({
  "name": "juto:config",
  summary: description || "Use node config package for meteor settings.",
  version: version || "4.0.0",
  git: repository || "https://github.com/JutoApp/meteor-juto-config.git",
  documentation: readme || "README.md"
});

Npm.depends({
  "config": "3.2.5",
  "fs-extra": "11.3.0",
  "@cunneen/underscore.deep": "1.0.0",
});

Package.registerBuildPlugin({
  "name": "compile-json-settings",
  "use": [
    "ecmascript@0.0.0",
    "underscore@1.0.0",
  ],
  "sources": [
    "config.js",
    "plugin.js"
  ],
  "npmDependencies": {
    "config": "3.3.12",
    "fs-extra": "11.3.0",
  }
});

Package.onUse((api) => {
  // api.versionsFrom("1.4.2.3");
  api.use("isobuild:compiler-plugin@1.0.0");
  api.use([
    "ecmascript@0.0.0",
    "underscore@1.0.0",
  ]);
  api.mainModule("config.js", "server");
  api.export("JutoConfig");
});
