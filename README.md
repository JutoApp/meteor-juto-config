juto:config
===

Configure meteor using [node-config], 
allowing you to split your development and production meteor settings JSON.

Based on the ideas from [4commerce:env-settings],
 this provides a meteor build plugin so that you can use it as part of a `meteor build` command.

### Background

[node-config] is great for pure node applications, and [4commerce:env-settings] is useful
 for meteor while in development.
   
However, when it comes to building your meteor application for deployment, if you have a cordova app 
then you can't use [4commerce:env-settings]. This is due to a limitation of meteor's build tool, 
which expects a settings file. From that settings file, the Meteor.settings.public object is extracted
and copied to the mobile application.

[juto:config] works around this limitation by providing a build plugin, which generates the settings 
json file needed by the ```meteor build``` command. It uses [node-config] to do this.

### Getting started

1. Add this package:
    ```
    meteor add juto:config
    ```
2. Edit your ```.meteor/packages``` file to put juto:config right near the top, just after 
```meteor-base``` (or ```meteor```).
3. Create a folder ```private/config``` in your meteor project.
4. Create a ```private/config/default.json``` file:
   ```json
    {
        "server": {
            "foo": "bar",
            "defaultServerKey": "default server value"
        },
        "public": {
            "foo": "public bar"
        }
    }
    ```

5. Create a ```private/config/production.json``` file with values to override the default ones 
when your app is in production:
    ```json
    {
        "server": {
            "foo": "production bar",
            "anotherServerKey": "production extra server val"
        },
        "public": {
            "foo": "production public bar",
            "anotherKey": "production extra val"
        }
    }
    ```

6. Create a ```server/load-config.js``` file to load the config files from 
```private/config``` and extend the global ```Meteor.settings``` object :

    ```js
    import { Meteor } from 'meteor/meteor';
    let path = require('path');
    
    Meteor.startup(()=>{
        // get the actual path of private/config/default.json
        var filePath = Assets.absoluteFilePath("config/default.json");
        // pass the actual path of private/config to JutoConfig.
        JutoConfig(path.dirname(filePath));
        // Now Meteor.settings environment has been set.
    
    });
    
    ```
    
7. Tell [juto:config] about your setup by creating a ```juto-settings-config.json``` file:

    ```json
    {
        "configSourcePathInPrivate":"/config",
        "outputSettingsFiles":true,
        "settingsProduction":"settings-production.json",
        "settingsDevelopment":"settings-development.json"
    }
    ```
    
    This tells it to output a ```settings-production.json``` file and a 
    ```settings-development.json``` file,
    which you can pass to the ```meteor build```, ```meteor run ios``` or ```meteor run android``` commands.
    
    These files should not be used when running meteor in development mode 
    for a web browser; Simply run it without the settings flag and let your 
     ```server/load-config.js``` (above) do the work of deciding which settings 
     to provide on the server and client.
     
    Note that ```settings-production.json``` file doesn't need to be 
    generated yet for you to be able to pass it to a ```meteor build```
    command; since [juto:config] provides a meteor build plugin, the 
     file will be generated just before it is needed. So you should be
     able to use this in a continuous integration environment.
     
     
The configuration above results in the following for ```Meteor.settings```:

Server - development :
```json
{
  "public": {
    "foo": "public bar"
  },
  "foo": "bar",
  "defaultServerKey": "default server value"
}
```

Client - development: 

```json
{
  "public": {
    "foo": "public bar"
  }
}
```

Server - production :

```json
{
  "public": {
    "foo": "production public bar",
    "anotherKey": "production extra val"
  },
  "foo": "production bar",
  "defaultServerKey": "default server value",
  "anotherServerKey": "production extra server val"
}

```

Client - production :

```json
{
  "public": {
    "foo": "production public bar",
    "anotherKey": "production extra val"
  }
}

```
     
### Deployment tools (mup, pm2-meteor etc)
    
If you're using [mup], [mupx], [pm2-meteor] or some other deployment tool,
 just symlink ```settings-production.json``` to your required settings file 
 (or ```settings-development.json``` if it's destined for a development server). E.g.:
 
```
mkdir .deploy_prod
cd .deploy_prod
mup init
rm settings.json
ln -s ../settings-production.json settings.json

```

### Now protect your production data

To ensure your production keys don't accidentally end up in a 
git repository, you have a few options:
 
##### Option 1 - Don't store them in git at all

Use .gitignore, e.g.

```
private/config/production.json
settings-development.json
settings-production.json
```

##### Option 2 - encrypt them

Use [git-crypt] or similar, e.g.

```
git-crypt init
echo 'private/config/production.json filter=git-crypt diff=git-crypt' >> .gitattributes 
echo 'settings-production.json filter=git-crypt diff=git-crypt' >> .gitattributes 
```

[node-config]:https://www.npmjs.com/package/config
[4commerce:env-settings]:https://github.com/4commerce-technologies-AG/meteor-package-env-settings
[juto:config]:https://github.com/jutoapp/meteor-juto-config
[mup]:https://github.com/kadirahq/meteor-up
[mupx]:https://github.com/arunoda/meteor-up/tree/mupx
[pm2-meteor]:https://github.com/andruschka/pm2-meteor
[git-crypt]:https://github.com/AGWA/git-crypt

