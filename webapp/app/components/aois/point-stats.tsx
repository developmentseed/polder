import { keyframes } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import { Box } from '@chakra-ui/react';
import axios from 'axios';
import { format } from 'date-fns/format.js';

import { PointStatsPopover } from './point-stats-popover';

import config from '$utils/config';

const markerPulse = keyframes`
  0%   {
    opacity: 0;
    width: 0.5rem;
    height: 0.5rem;
  }
  25%  {
    opacity: 1;
  }
  75%  {
    opacity: 1;
  }
  100% {
    opacity: 0;
    width: 2rem;
    height: 2rem;
  }
`;

interface PointStatsProps {
  lakeId: string;
  date: Date;
  indicatorId: string;
  lngLat: [number, number] | null;
  onClose: () => void;
}

type ReqStates = 'idle' | 'loading' | 'success' | 'error';

export function PointStats(props: PointStatsProps) {
  const { lngLat, lakeId, indicatorId, date, onClose } = props;

  const [data, setData] = useState({
    state: 'idle' as ReqStates,
    data: null as any
  });

  useEffect(() => {
    if (!lngLat) {
      return;
    }

    async function load() {
      try {
        setData({ state: 'loading', data: null });
        const cogUrl = getCogUrl(lakeId, indicatorId, date);
        const stats = await axios.get(
          `${config.TILER_API}/cog/point/${lngLat?.join(',')}?url=${cogUrl}`
        );
        const prevMeasurement = await searchPrevMeasurement(
          lakeId,
          indicatorId,
          lngLat!,
          date
        );

        setData({
          state: 'success',
          data: { ...stats.data, previous: prevMeasurement }
        });
      } catch (error) {
        setData({ state: 'error', data: null });
      }
    }

    load();
  }, [lngLat, lakeId, indicatorId, date]);

  return (
    <>
      <PointStatsPopover lngLat={lngLat} onClose={onClose} data={data} />
      {lngLat && (
        <Marker longitude={lngLat[0]} latitude={lngLat[1]}>
          <Box
            borderRadius='full'
            w={2}
            h={2}
            boxShadow='0 0 0 3px #fff'
            animation={`${markerPulse} 1s infinite`}
          />
        </Marker>
      )}
    </>
  );
}

function getCogUrl(lakeId: string, indicatorId: string, date: Date) {
  return `s3://whis-processed/whis_lakes_labelec/${lakeId}/c2rcc/indicators/${format(date, 'yyyyMMdd')}/${indicatorId}.tif`;
}

async function searchPrevMeasurement(
  lakeId: string,
  indicatorId: string,
  lngLat: [number, number],
  startDate: Date
) {
  try {
    // Search STAC items for possible candidates for previous measurements.

    const candidateQuery = {
      'filter-lang': 'cql2-json',
      limit: 10,
      sortby: [
        {
          field: 'datetime',
          direction: 'desc'
        }
      ],
      filter: {
        op: 'and',
        args: [
          {
            op: '=',
            args: [
              {
                property: 'collection'
              },
              'whis-lakes-labelec-scenes-c2rcc'
            ]
          },
          {
            op: 'like',
            args: [
              {
                property: 'id'
              },
              `${lakeId}%` // scne id is like 'LAKE_DATE'
            ]
          },
          {
            op: '>',
            args: [
              {
                property: 'properties.percent_valid_in_water_body'
              },
              0.01
            ]
          },
          {
            op: 't_before',
            args: [
              {
                property: 'datetime'
              },
              startDate.toISOString()
            ]
          }
        ]
      },
      fields: {
        include: ['properties', 'type'],
        exclude: ['bbox', 'links']
      }
    };

    const candidatesData = await axios.post(
      `${config.STAC_API}/search`,
      candidateQuery
    );

    const datesToTry = candidatesData.data.features.map(
      (feature) => new Date(feature.properties.datetime)
    );

    const stats = await Promise.all(
      datesToTry.map(async (date) => {
        const cogUrl = getCogUrl(lakeId, indicatorId, date);
        try {
          const stats = await axios.get(
            `${config.TILER_API}/cog/point/${lngLat?.join(',')}?url=${cogUrl}`
          );
          return {
            date,
            value: stats.data.values[0] as number
          };
        } catch (e) {
          return {
            date,
            value: null
          };
        }
      })
    );

    return stats.find((stat) => stat.value !== null);
  } catch (e) {
    return undefined;
  }
}
