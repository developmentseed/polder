const fs = require('fs-extra');
const turf = require

async function main() {
  const started = Date.now();

  const rawNuts = await fs.readJSON('./NUTS_RG_20M_2024_3857.geojson')
  const aoi = rawNuts.features.filter(ft =>
    ft.properties.NUTS_ID.includes(
      'BE1',
      'DE7',
      'ES3',
      'FRK',
      'PT1',
      'EL3',
      'UKK'
    )
  )

  await fs.writeJSON('../aoi.geojson', 
    { 
      ...rawNuts,
      features: aoi
    }
  )
  return started;
}

main()
  .then((startTime) =>
    console.log('Done in %d seconds!', (Date.now() - startTime) / 1000)
  )
  .catch((err) => console.log('Error:', err));