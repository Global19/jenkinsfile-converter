# What is this?

This is a module which implements a HTTP server that exposes endpoints which parse a Jenkinsfile and convert it to either a JSON or `config.yml`.

# How to see it working?

To `config.yml`
`curl --data-binary @your-jenkinsfile.groovy https://jenkinsto.cc/i`

To JSON (before converting to `config.yml`)
`curl --data-binary @your-jenkinsfile.groovy https://jenkinsto.cc/i/to-json`

# How does it work?

1. It starts a HTTP server listening to `28080/TCP` with express.js.
2. It loads `jfc-module.js`, which is expected to be a "webpacked" single JS file, and exposes `jenkinsToCCI(jenkinsfile: string): Promise<string>` as a module. This module is used as a callback for the HTTP server.
3. It exposes two endpoints:

    - `POST /i/to-config-yml` (or `/i/do`): Convert a Jenkinsfile in a request body to `config.yml` for CircleCI.
    - `POST /i/to-json` (for debugging purposes): Convert a Jenkinsfile in the `jenkinsfile` parameter of a url-encoded request body to a JSON representation of a Jenkinsfile.

# This directory has a separate package.json. Why?

Historically, this server application was developed as a separate project. For quicker development, almost all work from the project was imported here.
There were three main requirements for the importing work:

1. Keep the server and converter in a single repository: This was almost mandatory in order to support automatic build/deploy of servers upon code changes in converter.
2. Keep two parts separated: This was required because the converter should be highly modulized for future development. There was a benefit to keep them separate, as they depend on different modules, libraries, and syntax.
3. Keep things portable: Even though it is designed to deploy Docker containers for production, it is still subject to changes. Portablity makes the code bases robust to those changes.

In order to satisfy these requirements, we decided to employ the following approach.

-   Two completely separate code bases, i.e. the converter and the server.
-   Use a portable (i.e. "webpacked") converter for server.
-   Make the server portable (i.e. "webpacked") as well.

This is why we have separate package.json.

# For devs: How to build it?

Push the entire repository (i.e. `../`) to GitHub. The rest will be done through CircleCI.

Even though it should be confirmed with `../.circleci/config.yml`, generally speaking the following steps are executed on CircleCI to build a usable Docker image:

1. `npm i` in `../`
2. `npm run build` in `../`
3. `cp ../dist/jfc-module.js ./assets`
4. `yarn install`
5. `yarn build`
6. `docker build ./`

# For devs: How to test the server

`yarn ts-node` will run `ts-node` for debugging purposes.

Note: There is no "hot reload" available yet. I welcome any PR to enable it, while I'm also satisfied with the current approach to run `ts-node` repetitively. ;)
