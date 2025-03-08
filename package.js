Package.describe({
  "name": "juto:config",
  "version": "4.0.0",
  // Brief, one-line summary of the package.
  "summary": "Use node config package for meteor settings.",
  // URL to the Git repository containing the source code for this package.
  "git": "https://github.com/JutoApp/meteor-juto-config.git",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  "documentation": "README.md"
});

Npm.depends({
  "config": "3.2.5",
  "fs-extra": "2.0.0",
  "@cunneen/underscore.deep": "1.0.0",
});

Package.registerBuildPlugin({
  "name": "compile-json-settings",
  "use": [
    "ecmascript",
    "underscore",
  ],
  "sources": [
    "config.js",
    "plugin.js"
  ],
  "npmDependencies": {
    "config": "3.2.5",
    "fs-extra": "2.0.0"
  }
});

Package.onUse((api) => {
  // api.versionsFrom("1.4.2.3");
  api.use("isobuild:compiler-plugin@1.0.0");
  api.use([
    "ecmascript",
    "underscore"
  ]);
  api.mainModule("config.js", "server");
  api.export("JutoConfig");
});
