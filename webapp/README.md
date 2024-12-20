# Polder
{{Description}}

## Installation and Usage
The steps below will walk you through setting up your own instance of the project.

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v20 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) Package manager

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
yarn install
```

## Usage

### Config files
Configuration is done using [dot.env](https://parceljs.org/features/node-emulation/#.env-files) files.

These files are used to simplify the configuration of the app and should not contain sensitive information.

Run the project locally by copying the `.env` to `.env.local` and setting the following environment variables:

|                   |                                         |
| ----------------- | --------------------------------------- |
| `APP_TITLE`       | Application title (For meta tags)       |
| `APP_DESCRIPTION` | Application description (For meta tags) |
| `PUBLIC_URL`      | Full url for the app                    |
| `MAPBOX_TOKEN`    | Mapbox token                            |
| `STAC_API`        | STAC API endpoint                       |
| `TILER_API`       | TILER API endpoint                      |

### Runtime configuration
It is possible to change some configuration after the app is built by providing the configuration via the `app_config.js` file.

The file should be placed in the root of the `dist` directory and should contain a single object:

```js
window.__APP_CONFIG__ = {
  {{VARIABLE}}: {{value}}
};
```
A JSON object can also be used but needs to be converted to an object.

```js
window.__APP_CONFIG__ = JSON.parse('{{JSON_STRING}}');
```

The following variables can be changed at runtime, while the other ones are needed during the build process:
|                |                    |
| -------------- | ------------------ |
| `MAPBOX_TOKEN` | Mapbox token       |
| `STAC_API`     | STAC API endpoint  |
| `TILER_API`    | TILER API endpoint |


### Starting the app

```
yarn serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:9000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

# Deployment
To prepare the app for deployment run:

```
yarn build
```
or
```
yarn stage
```
This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.

**When building the site for deployment provide the base url trough the `PUBLIC_URL` environment variable. Omit the leading slash. (E.g. https://example.com)**

If you want to use any other parcel feature it is also possible. Example:
```
PARCEL_BUNDLE_ANALYZER=true yarn parcel build app/index.html
```