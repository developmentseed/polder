import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  List,
  ListItem,
  Skeleton,
  useDisclosure
} from '@chakra-ui/react';
import { Await, useLoaderData, useSearchParams } from 'react-router-dom';
import { Feature, MultiPolygon } from 'geojson';
import { LngLatBoundsLike } from 'mapbox-gl';
import Map, { Layer, Source } from 'react-map-gl';
import { CollecticonIsoStack } from '@devseed-ui/collecticons-chakra';
import debounce from 'lodash.debounce';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { add, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { format } from 'date-fns/format.js';

import { useSettings } from './settings';
import { MapOptionsDrawer, MapTerrain } from './map-options';
import { DataIndicator, IndicatorLegend } from './data-indicator';
import { PointStats } from './point-stats';
import { ShareOptions } from './share-options';

import { AreaTitle } from '$components/common/area-title';
import {
  IndicatorProperties,
  FeatureProperties,
  IndicatorDataRaw
} from '$utils/loaders';
import { FloatBox } from '$components/common/shared';
import { Timeline } from '$components/common/timeline';
import { DatePicker } from '$components/common/calendar';
import { Slider } from '$components/common/slider';
import { TimelineData, TimelineDataLoading, TimelineDataSuccess } from '$components/common/timeline/types';
import PageHeader from '$components/common/page-header';
import { userTzDate2utcString, utcString2userTzDate } from '$utils/date';
import { DataFetcher } from '$components/common/timeline/fetcher';

interface CogStatistics {
  id: string;
  assets: Record<
    string,
    {
      'raster:bands': {
        statistics: {
          mean: number;
          stddev: number;
          maximum: number;
          minimum: number;
        };
      }[];
    }
  >;
  properties: {
    datetime: string;
    percent_valid_in_water_body: number;
  };
}

const dataFetcher = new DataFetcher<CogStatistics>();

interface LakesLoaderData {
  lake: Feature<MultiPolygon, FeatureProperties>;
  indicators: IndicatorProperties[];
  indicatorData: IndicatorDataRaw[];
}

export function Component() {
  const promise = useLoaderData() as {
    data: Promise<LakesLoaderData>;
  };

  return (
    <Suspense
      fallback={
        <Flex position='absolute' bottom={8} left={4} right={4} gap={4}>
          <FloatBox minW={80}>
            <List display='flex' flexFlow='column' gap={4}>
              {Array.from({ length: 2 }, (_, i) => (
                <ListItem key={i}>
                  <Skeleton height='4rem' borderRadius='md' />
                </ListItem>
              ))}
            </List>
          </FloatBox>
          <FloatBox w='100%' minW={0} display='flex' flexFlow='column' gap={4}>
            <Flex display='flex' gap={2} justifyContent='space-between'>
              <Skeleton height='2rem' width='12rem' borderRadius='md' />
              <Skeleton height='2rem' width='12rem' borderRadius='md' />
            </Flex>
            <Skeleton height='100%' borderRadius='md' />
          </FloatBox>
        </Flex>
      }
    >
      <Await resolve={promise.data}>
        {({ lake, indicators, indicatorData }) => (
          <LakesSingle
            lake={lake}
            indicators={indicators}
            indicatorData={indicatorData}
          />
        )}
      </Await>
    </Suspense>
  );
}

Component.displayName = 'LakesComponent';

function LakesSingle(props: LakesLoaderData) {
  const { lake, indicators, indicatorData } = props;

  const [params, setSearchParams] = useSearchParams();
  const ind = params.get('ind');
  const searchParamDate = utcString2userTzDate(params.get('date') || '');

  const activeIndicator =
    indicators.find((indicator) => indicator.id === ind) || indicators[0];

  const domain: [Date, Date] = activeIndicator.dateDomain;

  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  const [panZoomDomainWidth, setPanZoomDomainWidth] = useState<number>();
  const [panZoomValue, setPanZoomValue] = useState({ x: 0, y: 0, zoom: 1 });

  const selectedDay = isNaN(searchParamDate.getTime())
    ? domain[1]
    : searchParamDate;

  const setSelectedDay = useCallback(
    (date: Date) => {
      const newParams = new URLSearchParams(params);
      newParams.set('date', userTzDate2utcString(date));
      setSearchParams(newParams);
    },
    [params, setSearchParams]
  );

  const settings = useSettings({
    indicatorId: activeIndicator.id,
    valueDomain: activeIndicator.valueDomain
  });
  const [valueMin, valueMax] = settings.rescale;
  const colorFn = settings.colorFn;
  const colorName = settings.colorName;

  const legend: IndicatorLegend = {
    unit: 'mg/m³',
    // @ts-expect-error ticks exists
    stops: colorFn.ticks().map((step) => ({
      color: colorFn(step),
      value: valueMin + (valueMax - valueMin) * step
    }))
  };

  const debouncedPanEnd = useMemo<(v: Date[]) => void>(
    () =>
      debounce(([firstDay, lastDay]) => {
        const daysToRequest = eachDayOfInterval<Date>({
          start: firstDay,
          end: add(lastDay, { days: 1 })
        });
        daysToRequest.forEach((day) => {
          dataFetcher.fetchData({
            key: ['lakes', lake.properties.idhidro, day.toISOString()],
            url: `${process.env.STAC_API}/collections/whis-lakes-labelec-scenes-c2rcc/items/${lake.properties.idhidro}_${format(day, 'yyyyMMdd')}`
          });
        });
      }, 500),
    [lake]
  );

  useEffect(() => {
    const handler = () => {
      // Ignore days without data.
      const data = dataFetcher
        .getData()
        .filter((d) => !(d.status === 'success' && !d.data))
        .map(({ key, ...rest }) => ({
          ...rest,
          date: utcString2userTzDate(key.last)
        }))
        .map((d) => {
          if (!d.data)
            return {
              date: d.date,
              status: d.status,
              data: undefined
            } as TimelineDataLoading;

          const band = d.data.assets[activeIndicator.id]['raster:bands'][0];
          return {
            date: d.date,
            status: 'success',
            data: {
              min: band.statistics.minimum,
              max: band.statistics.maximum,
              value: band.statistics.mean,
              valid_percent: d.data.properties.percent_valid_in_water_body
            }
          } as TimelineDataSuccess;
        });
      setTimelineData(data);
    };

    dataFetcher.addEventListener('data', handler);
    return () => {
      dataFetcher.removeEventListener('data', handler);
    };
  }, [activeIndicator.id]);

  const itemId = `${lake.properties.idhidro}_${format(selectedDay, 'yyyyMMdd')}`;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [mapOptions, setMapOptions] = useState({
    trueColor: true,
    processed: true,
    terrain: false
  });

  const onMapOptionChange = useCallback((opt, { value }) => {
    setMapOptions((prev) => ({
      ...prev,
      [opt]: value
    }));
  }, []);

  const [hoveringLake, setHoveringLake] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );

  const onMapClick = useCallback(
    (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedCoords(hoveringLake ? [lng, lat] : null);
    },
    [hoveringLake]
  );

  const onMapMouseMove = useCallback(
    (e) => {
      setHoveringLake(
        booleanPointInPolygon([e.lngLat.lng, e.lngLat.lat], lake)
      );
    },
    [lake]
  );

  const lakeIndicatorTileUrl = `${process.env.TILER_API}/collections/whis-lakes-labelec-scenes-c2rcc/items/${itemId}/tiles/{z}/{x}/{y}?assets=${activeIndicator.id}&rescale=${[valueMin, valueMax].join(',')}&colormap_name=${colorName}`;

  return (
    <>
      <PageHeader
        renderHeading={() => (
          <AreaTitle
            name={lake.properties.nome}
            volume={lake.properties.v_util_hm3}
          />
        )}
        renderControls={() => (
          <>
            <IconButton
              aria-label='Map options'
              size='xs'
              variant='ghost'
              colorScheme='base'
              icon={<CollecticonIsoStack />}
              onClick={onOpen}
              pointerEvents='all'
            />
            <Divider orientation='vertical' />
            <ShareOptions
              indicatorData={indicatorData}
              tileEndpoint={lakeIndicatorTileUrl}
            />
          </>
        )}
      />
      <Box as='main' flex='1'>
        <MapOptionsDrawer
          isOpen={isOpen}
          onClose={onClose}
          optTrueColor={mapOptions.trueColor}
          optProcessed={mapOptions.processed}
          optTerrain={mapOptions.terrain}
          onOptionChange={onMapOptionChange}
        />
        <Map
          mapboxAccessToken={process.env.MAPBOX_TOKEN}
          initialViewState={{
            bounds: lake.bbox as LngLatBoundsLike,
            fitBoundsOptions: {
              padding: {
                top: 32,
                bottom: 250,
                left: 32,
                right: 32
              }
            }
          }}
          maxBounds={[
            [-11.8, 35.7],
            [-4.2, 43.6]
          ]}
          cursor={hoveringLake ? 'crosshair' : 'grab'}
          onClick={onMapClick}
          onMouseMove={onMapMouseMove}
          style={{ inset: '0', position: 'absolute' }}
          mapStyle='mapbox://styles/devseed/cm2bn62f500px01pe9wrl0igs'
        >
          <MapTerrain showTerrain={mapOptions.terrain} />

          <PointStats
            lakeId={lake.id as string}
            indicatorId={activeIndicator.id}
            date={selectedDay}
            lngLat={selectedCoords}
            onClose={() => setSelectedCoords(null)}
          />

          <Source
            type='raster'
            tiles={[
              `${process.env.TILER_API}/collections/whis-lakes-labelec-scenes-c2rcc/items/${itemId}/tiles/{z}/{x}/{y}?assets=TCI`
            ]}
          >
            <Layer
              type='raster'
              id='tci'
              layout={{ visibility: mapOptions.trueColor ? 'visible' : 'none' }}
            />
          </Source>
          <Source type='raster' tiles={[lakeIndicatorTileUrl]}>
            <Layer
              type='raster'
              id='tsm'
              layout={{ visibility: mapOptions.processed ? 'visible' : 'none' }}
            />
          </Source>
        </Map>

        <Flex position='absolute' bottom={8} left={4} right={4} gap={4}>
          <FloatBox minW={80}>
            <Flex gap={4} flexFlow='column'>
              <Heading size='sm'>Indicators</Heading>
              <List display='flex' gap={2} flexFlow='column'>
                {indicators.map((indicator) => (
                  <ListItem key={indicator.id}>
                    <DataIndicator
                      id={indicator.id}
                      name={indicator.title}
                      isActive={indicator.id === activeIndicator.id}
                      legend={legend}
                      valueDomain={indicator.valueDomain}
                      rescaleValue={settings.rescale}
                      colormapValue={settings.colorName}
                      onIndicatorSettingsChange={settings.onSettingsChange}
                    />
                  </ListItem>
                ))}
              </List>
            </Flex>
          </FloatBox>
          <FloatBox w='100%' minW={0} display='flex' flexFlow='column' gap={2}>
            <Flex justifyContent='space-between' alignItems='center' gap={4}>
              <Heading size='sm'>Timeline</Heading>
              <DatePicker
                minDate={domain[0]}
                maxDate={domain[1]}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                getAllowedDays={useCallback(
                  ({ firstDay, lastDay }) => {
                    const days = indicatorData
                      .filter((d) =>
                        isWithinInterval(d.date, {
                          start: firstDay,
                          end: lastDay
                        })
                      )
                      .map((d) => d.date);

                    return Promise.resolve(days);
                  },
                  [indicatorData]
                )}
              />
              <Box>
                <Slider
                  max={panZoomDomainWidth}
                  value={Math.abs(panZoomValue.x)}
                  onChange={(v) => {
                    setPanZoomValue({
                      ...panZoomValue,
                      x: -v
                    });
                  }}
                />
              </Box>
            </Flex>
            <Timeline
              selectedDay={selectedDay}
              data={timelineData}
              legend={legend}
              dateDomain={domain}
              onDaySelect={setSelectedDay}
              onPanEnd={debouncedPanEnd}
              panZoomValue={panZoomValue}
              onPanZoomValueChange={setPanZoomValue}
              onPanZoomExtentChange={(v) => {
                setPanZoomDomainWidth(-v.minX);
              }}
            />
          </FloatBox>
        </Flex>
      </Box>
    </>
  );
}
