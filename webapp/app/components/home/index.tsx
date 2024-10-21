import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Skeleton
} from '@chakra-ui/react';
import {
  Await,
  useAsyncValue,
  useLoaderData,
  useNavigate
} from 'react-router-dom';
import { FeatureCollection, MultiPolygon, Point } from 'geojson';
import { Layer, Map, Source, useMap } from 'react-map-gl';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';

import config from '$utils/config';
import SmartLink from '$components/common/smart-link';
import { FeatureProperties } from '$utils/loaders';
import { AreaTitle } from '$components/common/area-title';
import { FloatBox } from '$components/common/shared';
import PageHeader from '$components/common/page-header';

export function Component() {
  const promise = useLoaderData() as {
    lakes: FeatureCollection<MultiPolygon, FeatureProperties>;
  };

  const [viewState, setViewState] = useState({
    pitch: 45
  });
  const [hoveredLake, setHoveredLake] = useState<string>();

  const [hoveredFeatureId, setHoveredFeatureId] = useState<number>();
  const navigate = useNavigate();

  const onRotateEnd = useCallback(({ viewState, target }) => {
    const bearing = Math.max(Math.min(viewState.bearing, 45), -45);
    target.flyTo({ bearing });
  }, []);

  return (
    <>
      <PageHeader renderHeading={() => <AreaTitle name='Portugal' isRoot />} />
      <Box as='main' flex='1'>
        <Map
          {...viewState}
          mapboxAccessToken={config.MAPBOX_TOKEN}
          style={{ inset: '0', position: 'absolute' }}
          mapStyle='mapbox://styles/devseed/cm2bn62f500px01pe9wrl0igs'
          maxBounds={[
            [-11.8, 35.7],
            [-4.2, 43.6]
          ]}
          maxPitch={60}
          minPitch={40}
          logoPosition='bottom-left'
          cursor={hoveredFeatureId ? 'pointer' : 'grab'}
          onMove={(evt) => setViewState(evt.viewState)}
          onRotateEnd={onRotateEnd}
          interactiveLayerIds={['lake.subtitle', 'lake.title', 'lake.line']}
          onMouseEnter={(e) => {
            setHoveredFeatureId(e.features?.[0]?.properties?.idhidro);
          }}
          onMouseLeave={() => setHoveredFeatureId(undefined)}
          onClick={(e) => {
            if (!e.features?.length) return;

            const feature = e.features[0];
            const id = feature.properties?.idhidro;
            navigate(`/aois/${id}`);
          }}
        >
          <Suspense>
            <Await resolve={promise.lakes}>
              <LakesMapLayer
                focusLake={hoveredLake}
                hoverLakeId={hoveredFeatureId}
              />
            </Await>
          </Suspense>
        </Map>

        <FloatBox position='absolute' bottom={8} left={4} right={4} pb={0}>
          <Flex gap={4} alignItems='center'>
            <Heading size='sm'>Aois</Heading>
            <Suspense>
              <Await resolve={promise.lakes}>
                {(data) => <Badge>{data.features.length}</Badge>}
              </Await>
            </Suspense>
          </Flex>
          <List display='flex' mx={-4} gap={4} py={2} px={4} overflowX='scroll'>
            <Suspense
              fallback={
                <>
                  {Array.from({ length: 8 }, (_, i) => (
                    <ListItem key={i} minW='fit-content'>
                      <Skeleton height='8rem' width='18rem' borderRadius='md' />
                    </ListItem>
                  ))}
                </>
              }
            >
              <Await
                resolve={promise.lakes}
                errorElement={<p>Error loading!</p>}
              >
                <LakeList onHoverChange={setHoveredLake} />
              </Await>
            </Suspense>
          </List>
        </FloatBox>
      </Box>
    </>
  );
}

Component.displayName = 'HomeComponent';

interface LakeListProps {
  onHoverChange: (id: string | undefined) => void;
}

function LakeList(props: LakeListProps) {
  const { onHoverChange } = props;

  const data = useAsyncValue() as FeatureCollection<
    MultiPolygon,
    FeatureProperties
  >;

  return (
    <>
      {data.features.map((f) => (
        <ListItem key={f.properties.idhidro} minW='fit-content'>
          <SmartLink
            display='flex'
            alignItems='end'
            p={4}
            bgColor='#e2e2e2'
            borderRadius='md'
            height='8rem'
            width='18rem'
            fontSize='sm'
            fontWeight='600'
            bg={`url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[${bbox(f).join(',')}]/288x152@2x?access_token=${config.MAPBOX_TOKEN}')`}
            bgSize='cover'
            color='surface.500'
            to={`/aois/${f.id}`}
            onMouseEnter={() => {
              onHoverChange(f.properties.idhidro);
            }}
            onMouseLeave={() => onHoverChange(undefined)}
          >
            <Flex as='span' gap={2} alignItems='center'>
              {f.properties.nome}
              <Badge
                fontWeight='600'
                bg='surface.300a'
                textTransform='none'
                color='currentcolor'
              >
                {f.properties.v_util_hm3} hm<sup>3</sup>
              </Badge>
            </Flex>
          </SmartLink>
        </ListItem>
      ))}
    </>
  );
}

interface LakesMapLayerProps {
  focusLake: string | undefined;
  hoverLakeId: number | undefined;
}

function LakesMapLayer(props: LakesMapLayerProps) {
  const { focusLake, hoverLakeId } = props;

  const data = useAsyncValue() as FeatureCollection<
    MultiPolygon,
    FeatureProperties
  >;

  const { current: mapInstance } = useMap();

  const lakesPoints: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: data.features.map((f) => ({
      ...centroid(f),
      properties: f.properties
    }))
  };

  useEffect(() => {
    if (!mapInstance) return;

    const f = data.features.find((f) => f.properties?.idhidro === focusLake);
    if (!f) return;

    mapInstance.fitBounds(bbox(f) as mapboxgl.LngLatBoundsLike, {
      pitch: 41,
      bearing: -13,
      maxZoom: 12,
      padding: {
        top: 0,
        bottom: 120,
        left: 0,
        right: 0
      }
    });
  }, [mapInstance, data, focusLake]);

  const haloFormula: mapboxgl.Expression = [
    'case',
    ['==', ['get', 'idhidro'], hoverLakeId || null],
    '#e8e9ff',
    '#ffffff'
  ];

  return (
    <>
      <Source type='geojson' data={data}>
        <Layer
          id='lakes'
          type='fill'
          paint={{
            'fill-color': '#0c3e94'
          }}
        />
      </Source>

      <Source type='geojson' data={lakesPoints}>
        <Layer
          id='lake.subtitle'
          type='symbol'
          layout={{
            'text-size': 12,
            'text-allow-overlap': true,
            'icon-offset': [-12, 0],
            'text-font': ['Red Hat Text Medium', 'Arial Unicode MS Regular'],
            'text-justify': 'left',
            'text-offset': [-0.9, -1.5],
            'icon-size': 2,
            'text-anchor': 'bottom-left',
            'text-field': [
              'concat',
              ['to-string', ['get', 'v_util_hm3']],
              ' hm3'
            ]
          }}
          paint={{
            'icon-translate': [0, 0],
            'text-halo-color': haloFormula,
            'text-halo-width': 2,
            'text-color': '#2b2d42'
            // 'text-translate': [-16, -16]
          }}
        />
        <Layer
          id='lake.title'
          type='symbol'
          layout={{
            'text-allow-overlap': true,
            'icon-anchor': 'bottom-left',
            'text-font': ['Red Hat Text Medium', 'Arial Unicode MS Regular'],
            'text-justify': 'left',
            'text-padding': 0,
            'text-offset': [-0.8, -2.2],
            'icon-size': 1.3,
            'text-anchor': 'bottom-left',
            'text-field': ['to-string', ['get', 'nome']]
          }}
          paint={{
            'text-color': '#2b2d42',
            'icon-opacity': 0.65,
            'text-halo-color': haloFormula,
            'text-halo-width': 2
            // 'text-translate': [-19, -32]
          }}
        />

        <Layer
          id='lake.line'
          type='symbol'
          layout={{
            'icon-allow-overlap': true,
            'icon-offset': [16, -4],
            'icon-image': 'map-marker-arrow'
          }}
        />
      </Source>
    </>
  );
}
