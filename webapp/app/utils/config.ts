export default {
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  STAC_API: process.env.STAC_API,
  TILER_API: process.env.TILER_API,

  /* @ts-expect-error __APP_CONFIG__ is the global config injected data */
  ...window.__APP_CONFIG__
};
