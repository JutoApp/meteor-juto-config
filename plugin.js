// Meteor build plugin that loads config from private/config and writes output files according to settings-config.json
Plugin.registerCompiler({
  extensions: ["json"],
  filenames: ['juto-settings-config.json']
}, function () {

  let fs = require('fs-extra');
  let path = require('path');

  function JSONSettingsCompiler() {
  }


  /*
   The compiler class must implement the processFilesForTarget method that is given the source files
   for a target (server or client part of the package/app).
   */
  JSONSettingsCompiler.prototype.processFilesForTarget = function (files) {

    files.forEach(function (file) {

      /*
       operations on file within meteor build plugin:
       getContentsAsString - Returns the full contents of the file as a string.
       getBasename - Returns the filename of the file.

       */

      /**
       * temporarily change the NODE_ENV, load the appropriate config, and write it to fileOutputPath
       * @param nodeEnv
       * @param configSourcePath
       * @param fileOutputPath
       */
      function loadConfigAndWriteOutput(nodeEnv, configSourcePath, fileOutputPath) {
        let oldProcessNodeEnv = process.env.NODE_ENV,
          loadedAndMergedConfigObj,
          serverConfig,
          publicConfig,
          configToWrite;

        let jutoConfig = require('./config');

        process.env.NODE_ENV = nodeEnv;
        loadedAndMergedConfigObj = jutoConfig.JutoConfig(configSourcePath);
        serverConfig = loadedAndMergedConfigObj.server;
        publicConfig = loadedAndMergedConfigObj.public;
        configToWrite = _.deepExtend({}, serverConfig, true);
        configToWrite.public = publicConfig;
        fs.writeJsonSync(fileOutputPath, configToWrite);
        process.env.NODE_ENV = oldProcessNodeEnv;
      }

      if ("juto-settings-config.json" === file.getBasename()) {
        let ourConfig,
          configSourcePath,
          fileOutputPath;

        ourConfig = JSON.parse(file.getContentsAsString());

        fileOutputPath = process.env.PWD + "/" + ourConfig.settingsProduction;
        configSourcePath = process.env.PWD + "/" + ourConfig.configSourcePath;

        try {
          loadConfigAndWriteOutput("production", configSourcePath, fileOutputPath);
        } catch (e) {
          console.log("Couldn't parse production config.");
          console.error(e);
        }
        // do the same for "development"
        fileOutputPath = process.env.PWD + "/" + ourConfig.settingsDevelopment;
        loadConfigAndWriteOutput("development", configSourcePath, fileOutputPath);
      }
    });
  };
  var compiler = new JSONSettingsCompiler();
  return compiler;
});
