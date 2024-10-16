const fs = require('fs-extra');
const reproject = require('reproject');
const epsg = require('epsg');

async function main() {
  const started = Date.now();

  const rawNuts = await fs.readJSON('./NUTS_RG_20M_2024_3857.geojson')
  const aoiIds = [ 'BE1', 'DE7', 'ES3', 'FRK', 'PT1', 'EL3', 'UKK' ]

  const geojson = {
    ...rawNuts,
    features: rawNuts.features
      .filter(ft => ft.properties.LEVL_CODE === 1)
      .filter(ft => aoiIds.includes(ft.properties.NUTS_ID))
    }

  const reprojectedGeojson = reproject.toWgs84(geojson, undefined, epsg)

  await fs.writeJSON('../aoi.geojson', {
    type: 'FeatureCollection',
    features: reprojectedGeojson.features
  })
  return started;
}

main()
  .then((startTime) =>
    console.log('Done in %d seconds!', (Date.now() - startTime) / 1000)
  )
  .catch((err) => console.log('Error:', err));