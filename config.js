// ==== node-config package, with suppressed warning.
process.env.SUPPRESS_NO_CONFIG_WARNING = true;
let config = require('config');
process.env.SUPPRESS_NO_CONFIG_WARNING = false;


let fs = require('fs-extra');
let path = require('path');

/**
 * Load configuration files using node-config from the provided folder path. Updates the global Meteor.settings if it
 * already exists.
 * @param folderPath the path under which config files should be loaded.
 * @returns {config} the merged config object.
 * @constructor
 */
export let JutoConfig = (folderPath) => {
  // now load the config from the asset path.
  let meteorConfig = config.util.loadFileConfigs(folderPath);
  let envConfig = false;
  if (process.env.NODE_CONFIG) {
    // we've got some config in the env var. It should be added after the file-based config.
    try {
      envConfig = JSON.parse(process.env.NODE_CONFIG);
      if (envConfig) {
        _.deepExtend(meteorConfig, envConfig, true);
      }
    } catch (e) { // we couldn't parse it, just log the error and continue.
      console.error(e);
    }
  }

  if (typeof Meteor !== "undefined") { // side-effect mode: updates Meteor.settings

    let serverConfig = meteorConfig.server;

    // extend Meteor.settings.public
    let publicConfig = meteorConfig.public;

    if (Meteor.settings) {
      _.deepExtend(Meteor.settings, serverConfig, true);
    } else {
      Meteor.settings = serverConfig;
    }

    if (Meteor.settings.public) {
      _.deepExtend(Meteor.settings.public, publicConfig, true);
    } else {
      Meteor.settings.public = publicConfig;
      // check if we need to append the new public settings also
      // to the runtime_environment. this happens, when no settings
      // before via --settings or METEOR_SETTINGS was set.
      // taken from packages/meteor/server_environments.js
      // Push a subset of settings to the client.
      // ----
      // if PR on github is accepted
      // https://github.com/meteor/meteor/pull/4704
      // then this won't be necessary anymore
      if (typeof __meteor_runtime_config__ === "object") {
        __meteor_runtime_config__.PUBLIC_SETTINGS = Meteor.settings.public;
      }
    }
  }  // module mode: returns a settings object
  return meteorConfig;

};
