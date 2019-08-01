/* eslint-disable no-console */
// Meteor build plugin that loads config from private/config and writes output files according to settings-config.json
// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require("fs-extra");

Plugin.registerCompiler({
  "extensions": ["json"],
  "filenames": ["juto-settings-config.json"]
}, () => {
  function JSONSettingsCompiler() {
  }


  /*
   The compiler class must implement the processFilesForTarget method that is given the source files
   for a target (server or client part of the package/app).
   */
  // noinspection JSUnusedGlobalSymbols
  JSONSettingsCompiler.prototype.processFilesForTarget = function (files) {
    files.forEach((file) => {
      /*
       operations on file within meteor build plugin:
       getContentsAsString - Returns the full contents of the file as a string.
       getBasename - Returns the filename of the file.

       */

      /**
       * temporarily change the NODE_ENV (and HOST), load the appropriate config, and write it to fileOutputPath
       * @param nodeEnv
       * @param configSourcePath
       * @param fileOutputPath
       * @param host
       */
      function loadConfigAndWriteOutput(nodeEnv, configSourcePath, fileOutputPath, host) {
        const oldProcessNodeEnv = process.env.NODE_ENV;
        const oldHost = process.env.HOST;

        // eslint-disable-next-line global-require
        const jutoConfig = require("./config");

        process.env.NODE_ENV = nodeEnv;
        if (host) {
          process.env.HOST = host;
        }
        const loadedAndMergedConfigObj = jutoConfig.JutoConfig(configSourcePath);
        const serverConfig = loadedAndMergedConfigObj.server;
        const publicConfig = loadedAndMergedConfigObj.public;
        const configToWrite = _.deepExtend({}, serverConfig, true);
        configToWrite.public = publicConfig;
        fs.writeJsonSync(fileOutputPath, configToWrite);
        process.env.NODE_ENV = oldProcessNodeEnv;
        process.env.HOST = oldHost;
      }

      if (file.getBasename() === "juto-settings-config.json") {
        const ourConfig = JSON.parse(file.getContentsAsString());
        const configSourcePath = `${process.env.PWD}/${ourConfig.configSourcePath}`;
        let fileOutputPath;
        if (Object.prototype.hasOwnProperty.call(ourConfig, "environments")) {
          // loop through environments
          const {environments} = ourConfig;
          environments.forEach((env) => {
            console.log(`processing ${JSON.stringify(env)}`);
            fileOutputPath = `${process.env.PWD}/${env.outputFile}`;
            try {
              loadConfigAndWriteOutput(env.NODE_ENV, configSourcePath, fileOutputPath, env.HOST);
            } catch (e) {
              console.log(`Couldn't parse ${env.NODE_ENV} config.`);
              console.error(e);
            }
          });
        } else {
          // one for production, one for development
          fileOutputPath = `${process.env.PWD}/${ourConfig.settingsProduction}`;
          try {
            console.log(`processing ${fileOutputPath}`);
            loadConfigAndWriteOutput("production", configSourcePath, fileOutputPath);
          } catch (e) {
            console.log("Couldn't parse production config.");
            console.error(e);
          }
          // do the same for "development"
          fileOutputPath = `${process.env.PWD}/${ourConfig.settingsDevelopment}`;
          console.log(`processing ${fileOutputPath}`);
          loadConfigAndWriteOutput("development", configSourcePath, fileOutputPath);
        }
      }
    });
  };
  return new JSONSettingsCompiler();
});
