import {
  interpolateBlues,
  interpolateGreens,
  interpolateOranges,
  interpolatePurples,
  interpolateReds,
  interpolateViridis,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateCividis,
  interpolateWarm,
  interpolateCool
  // ,interpolateBuGn,
  // interpolateBuPu,
  // interpolateGnBu,
  // interpolateOrRd,
  // interpolatePuBuGn,
  // interpolatePuBu,
  // interpolatePuRd,
  // interpolateRdPu,
  // interpolateYlGnBu,
  // interpolateYlGn,
  // interpolateYlOrBr,
  // interpolateYlOrRd
} from 'd3';

function ramp(range: string[]) {
  const n = range.length;
  return function (t: number) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

function rgb2hex(rgb: [number, number, number]) {
  return (
    '#' +
    rgb
      .map((c) => Math.round(c * 255).toString(16))
      .map((str) => (str.length === 1 ? `0${str}` : str))
      .join('')
  );
}

function createColorInterpolator(colors: number[][]) {
  return ramp(colors.map(rgb2hex));
}

import { algae } from './algae';
import { deep } from './deep';
import { dense } from './dense';
import { gray } from './gray';
import { haline } from './haline';
import { ice } from './ice';
import { matter } from './matter';
import { phase } from './phase';
import { solar } from './solar';
import { thermal } from './thermal';
import { turbid } from './turbid';

export const colorInterpolators = {
  blues: interpolateBlues,
  greens: interpolateGreens,
  oranges: interpolateOranges,
  purples: interpolatePurples,
  reds: interpolateReds,
  viridis: interpolateViridis,
  inferno: interpolateInferno,
  magma: interpolateMagma,
  plasma: interpolatePlasma,
  cividis: interpolateCividis,
  hot: interpolateWarm,
  cool: interpolateCool,
  // bugn: interpolateBuGn,
  // bupu: interpolateBuPu,
  // gnbu: interpolateGnBu,
  // orrd: interpolateOrRd,
  // pubugn: interpolatePuBuGn,
  // pubu: interpolatePuBu,
  // purd: interpolatePuRd,
  // rdpu: interpolateRdPu,
  // ylgnbu: interpolateYlGnBu,
  // ylgn: interpolateYlGn,
  // ylorbr: interpolateYlOrBr,
  // ylorrd: interpolateYlOrRd,
  algae: createColorInterpolator(algae),
  deep: createColorInterpolator(deep),
  dense: createColorInterpolator(dense),
  gray: createColorInterpolator(gray),
  haline: createColorInterpolator(haline),
  ice: createColorInterpolator(ice),
  matter: createColorInterpolator(matter),
  phase: createColorInterpolator(phase),
  solar: createColorInterpolator(solar),
  thermal: createColorInterpolator(thermal),
  turbid: createColorInterpolator(turbid)
};
