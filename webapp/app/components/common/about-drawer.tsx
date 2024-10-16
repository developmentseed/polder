import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading
} from '@chakra-ui/react';

interface AboutDrawerProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function AboutDrawer(props: AboutDrawerProps) {
  const { onClose, isOpen } = props;

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size='xl'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>About</DrawerHeader>
        <DrawerBody display='flex' flexFlow='column' gap={4}>
          <Heading as='h2'>
            Welcome to the Water Health Indicator Service
          </Heading>
          <p>
            Our service provides a continuously updated data stream about the
            environmental health of inland water bodies.
          </p>

          <p>
            The service is an API that provides monitoring and reporting
            capabilities that allow private sector and public agencies to track
            a set of specialised and highly descriptive Water Health Indicators.
            Indicators will be physical descriptions derived from satellite
            remote sensing, such as water extent, turbidity, chlorophyll
            concentration, and evapotranspiration.
          </p>

          <p>
            One key advantage of EO-derived indicators is that they are
            harmonised in time and space. They are computed with the same
            underlying method and based on the same input data, regardless of
            the observation date or geographic location.
          </p>

          <p>
            Sources like the Harmonized Landsat Sentinel-2 (HLS) dataset help
            make the indicators consistent without the usual overhead of massive
            data processing. This property makes the indicators compatible and
            comparable against each other without the usual overhead of massive
            data processing.
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
