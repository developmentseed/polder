import 'mapbox-gl/dist/mapbox-gl.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import theme from '$styles/theme';

import PageLayout from '$components/common/page-layout';
import { requestLakes, requestSingleLake } from '$utils/loaders';
import { ErrorBoundary } from '$components/error-bounday';

const publicUrl = process.env.PUBLIC_URL || '';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <PageLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          loader: requestLakes,
          lazy: () => import('$components/home')
        },
        {
          path: 'aois/:id',
          loader: requestSingleLake,
          lazy: () => import('$components/aois')
        }
      ]
    }
  ],
  {
    basename: new URL(
      publicUrl.startsWith('http')
        ? publicUrl
        : `https://ds.io/${publicUrl.replace(/^\//, '')}`
    ).pathname
  }
);

// Root component.
function Root() {
  useEffect(() => {
    // Hide the welcome banner.
    const banner = document.querySelector('#welcome-banner');
    if (!banner) return;
    banner.classList.add('dismissed');
    setTimeout(() => banner.remove(), 500);
  }, []);

  return (
    <ChakraProvider theme={theme} resetCSS>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);

/* eslint-disable-next-line fp/no-mutating-methods */
Object.defineProperty(Array.prototype, 'last', {
  enumerable: false,
  configurable: true,
  get: function () {
    return this[this.length - 1];
  },
  set: undefined
});
