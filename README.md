# OpenWWT-Web - WorldWide Telescope
This repository contains the HTML5 SDK which is the rendering engine for the web client and the embeddable web control. It also contains the full web client code. This repository does not contain all the server-side endpoints needed to render tiles, constellation lines, etc. Some samples will be included in the future.

## Prerequisites
* Visual Studio 2013
* NodeJs
* Grunt

## Getting Started
* [Install NodeJs](http://nodejs.org/download/). 
* In a command prompt, navigate to the webclient\bootstrap and type `npm install`. If you encounter any errors (I always do on a clean machine), ensure `%USERPROFILE%\AppData\Roaming\npm` exists (create it if not) and your system path includes `;%USERPROFILE%\AppData\Roaming\npm`. 
* Install the grunt client. Once you have installed the node_modules (via `npm install` above), type `npm install grunt-cli` from the same command prompt.
* Edit webclient\bootstrap\gruntfile.js and remove `'copy:webclient'` globally in the file. This task copies the webclient to the worldwidetelescope web site codebase and will clutter your filesystem if you are not developing on the worldwidetelescope.org web site.
* Run `grunt watch` from the same command prompt. 
* Disable any LESS compilers you might be using as visual studio extensions. Grunt watch will do everything for you.

Once you have completed the above you are set to make your own modifications to the code and your LESS and JS will be compiled/uglified. You can view the webclient by right-clicking webclient\default.aspx > view in browser.

To make changes to the sdk, simply compile the code while the grunt watch thread is active. Grunt will take the js output and create the wwtsdk.js file. To use this file instead of the production file, add `?debug=local` to the query string.

If you are not familiar with [Angular JS](https://angularjs.org/), I recommend taking some time to learn angularjs as this is a very heavy angular app. We also use the bootstrap library and compile our own less with the bootstrap less lib. You may also want to read up on ScriptSharp which we use to compile the c# classes into javascript. We recently upgraded to [ScriptSharp v0.8](https://github.com/nikhilk/scriptsharp/wiki/Release-Notes)
