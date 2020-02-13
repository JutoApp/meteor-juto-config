Package.describe({
  "name": "juto:config",
  "version": "3.0.0",
  // Brief, one-line summary of the package.
  "summary": "Use node config package for meteor settings.",
  // URL to the Git repository containing the source code for this package.
  "git": "https://github.com/JutoApp/meteor-juto-config.git",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  "documentation": "README.md"
});

Npm.depends({
  "fs-extra": "2.0.0"
});

Package.registerBuildPlugin({
  "name": "compile-json-settings",
  "use": [
    "ecmascript",
    "underscore",
    "juto:underscore-deep@0.0.5"
  ],
  "sources": [
    "config.js",
    "plugin.js"
  ],
  "npmDependencies": {
    "config-gitcrypt": "1.24.0",
    "fs-extra": "2.0.0",
    // A breaking change was introduced in @babel/runtime@7.0.0-beta.56
    // with the removal of the @babel/runtime/helpers/builtin directory.
    // Since the compile-coffeescript plugin is bundled and published with
    // a specific version of babel-compiler and babel-runtime, it also
    // needs to have a reliable version of the @babel/runtime npm package,
    // rather than delegating to the one installed in the application's
    // node_modules directory, so the coffeescript package can work in
    // Meteor 1.7.1 apps as well as 1.7.0.x and earlier.
    "@babel/runtime": "7.0.0-beta.55"
  }
});

Package.onUse((api) => {
  api.versionsFrom("1.4.2.3");
  api.use("isobuild:compiler-plugin@1.0.0");
  api.use([
    "ecmascript",
    "underscore",
    "juto:underscore-deep@0.0.5"
  ]);
  api.mainModule("config.js", "server");
  api.export("JutoConfig");
});
