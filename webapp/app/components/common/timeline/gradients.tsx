import React from 'react';

export function Gradients(props: { stops: { color: string }[] }) {
  const { stops } = props;

  // Solve for fences vs posts
  const colorStopsWidth = 100 / (stops.length - 1);

  return (
    <>
      <linearGradient id='data-gradient' x1={0} x2={0} y1={1} y2={0}>
        {stops.slice(0, -1).map((stop, index) => (
          <stop
            /* eslint-disable-next-line react/no-array-index-key */
            key={index}
            offset={`${index * colorStopsWidth}%`}
            stopColor={stop.color}
          />
        ))}
        <stop offset='100%' stopColor={stops.last.color} />
      </linearGradient>
      <linearGradient id='data-gradient-bg' x1={0} x2={0} y1={1} y2={0}>
        {stops.slice(0, -1).map((stop, index) => (
          <stop
            /* eslint-disable-next-line react/no-array-index-key */
            key={index}
            offset={`${index * colorStopsWidth}%`}
            stopColor={stop.color}
            stopOpacity={0.16}
          />
        ))}
        <stop offset='100%' stopColor={stops.last.color} stopOpacity={0.16} />
      </linearGradient>
    </>
  );
}
