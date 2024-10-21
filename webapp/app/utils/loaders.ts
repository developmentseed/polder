import axios from 'axios';
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';
import { defer } from 'react-router-dom';
import { round } from './format';

interface StacSearchResponse
  extends FeatureCollection<MultiPolygon, FeatureProperties> {
  context: {
    limit: number;
    matched: number;
    returned: number;
  };
  links: {
    rel: string;
    href: string;
    type: string;
    [key: string]: any;
  }[];
}

interface StacItemResponse extends Feature<MultiPolygon, FeatureProperties> {}

export interface FeatureProperties {
  area_ha: number;
  classifica: string;
  datetime: string;
  energia: string;
  eu_cd_aap: string;
  eu_cd_rb: string;
  idhidro: string;
  is_water_body_feature: boolean;
  legislacao: string;
  nome: string;
  npa: number;
  orig_vetor: string;
  st_area_sh: number;
  st_length_: number;
  stats_time_series_href: string;
  v_util_hm3: number;
  stats_time_series_url: string;
}

export interface IndicatorDataRaw {
  date: Date;
  percent_valid_in_water_body: number;
  chlorophyll: {
    mean: number;
    maximum: number;
    minimum: number;
    stddev: number;
  };
  tsm: {
    mean: number;
    maximum: number;
    minimum: number;
    stddev: number;
  };
}

type IndicatorDataResponse = Record<string, Omit<IndicatorDataRaw, 'date'>>;

export interface IndicatorProperties {
  id: string;
  title: string;
  dateDomain: [Date, Date];
  valueDomain: [number, number];
}

export async function requestLakes() {
  const dataPromise = async () => {
    const data = await axios.get<StacSearchResponse>(
      `${process.env.STAC_API}/collections/whis-lakes-labelec-features-c2rcc/items?limit=100`
    );

    return data.data;
  };

  return defer({ lakes: dataPromise() });
}

export async function requestSingleLake({
  request,
  params
}: {
  request: Request;
  params: { id: string };
}) {
  const dataPromise = async () => {
    try {
      const { data: lakeData } = await axios.get<StacItemResponse>(
        `${process.env.STAC_API}/collections/whis-lakes-labelec-features-c2rcc/items/${params.id}`,
        {
          signal: request.signal
        }
      );

      const { data: lakeIndicatorData } =
        await axios.get<IndicatorDataResponse>(
          lakeData.properties.stats_time_series_url
        );

      // Convert from keyed object to array of objects.
      const values = Object.entries(lakeIndicatorData).map<IndicatorDataRaw>(
        ([k, v]) => {
          const [, y, m, day] = /(\d{4})(\d{2})(\d{2})/.exec(k)!.map(Number);
          return {
            date: new Date(y, m - 1, day),
            ...v
          };
        }
      );
      const dateDomain = [values[0].date, values.last.date];

      const maxTsm = round(Math.max(...values.map((v) => v.tsm.maximum)), 3);
      const maxCh = round(
        Math.max(...values.map((v) => v.chlorophyll.maximum)),
        3
      );

      return {
        lake: lakeData,
        indicators: [
          {
            id: 'chlorophyll',
            title: 'Chlorophyll',
            dateDomain,
            valueDomain: [0, Math.ceil(maxCh)]
          },
          {
            id: 'tsm',
            title: 'Total Suspended Matter',
            dateDomain,
            valueDomain: [0, Math.ceil(maxTsm)]
          }
        ]
      };
    } catch (error) {
      if (error.response.status === 404) {
        throw new Response('Not found', { status: 404 });
      }
      throw error;
    }
  };

  return defer({ data: dataPromise() });
}
