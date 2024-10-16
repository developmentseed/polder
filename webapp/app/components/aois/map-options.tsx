import React, { useEffect, useRef } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  Switch
} from '@chakra-ui/react';
import { useMap } from 'react-map-gl';
import { TerrainSpecification } from 'mapbox-gl';

interface MapOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  optTrueColor: boolean;
  optProcessed: boolean;
  optTerrain: boolean;
  onOptionChange: (key: string, value: { value: boolean }) => void;
}

export function MapOptionsDrawer(props: MapOptionsDrawerProps) {
  const {
    isOpen,
    onClose,
    onOptionChange,
    optTrueColor,
    optProcessed,
    optTerrain
  } = props;

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size='xs'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton top={4} />
        <DrawerHeader>
          <Heading as='h2' size='md'>
            Map options
          </Heading>
        </DrawerHeader>
        <DrawerBody display='flex' flexFlow='column' gap={4}>
          <Heading as='h3' size='sm'>
            Details
          </Heading>
          <FormControl
            display='flex'
            alignItems='center'
            gap={2}
            justifyContent='space-between'
            px={2}
          >
            <FormLabel
              htmlFor='true-color'
              fontFamily='body'
              fontSize='sm'
              mb='0'
            >
              True color image
            </FormLabel>
            <Switch
              id='true-color'
              isChecked={optTrueColor}
              onChange={() => {
                onOptionChange('trueColor', { value: !optTrueColor });
              }}
            />
          </FormControl>
          <FormControl
            display='flex'
            alignItems='center'
            gap={2}
            justifyContent='space-between'
            px={2}
          >
            <FormLabel
              htmlFor='process-color'
              fontFamily='body'
              fontSize='sm'
              mb='0'
            >
              Processed image
            </FormLabel>
            <Switch
              id='process-color'
              isChecked={optProcessed}
              onChange={() => {
                onOptionChange('processed', { value: !optProcessed });
              }}
            />
          </FormControl>
          <FormControl
            display='flex'
            alignItems='center'
            gap={2}
            justifyContent='space-between'
            px={2}
          >
            <FormLabel htmlFor='terrain' fontFamily='body' fontSize='sm' mb='0'>
              Terrain elevation
            </FormLabel>
            <Switch
              id='terrain'
              isChecked={optTerrain}
              onChange={() => {
                onOptionChange('terrain', { value: !optTerrain });
              }}
            />
          </FormControl>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

// We need this whole thing for the terrain because we need to get the original
// value set in the map style.
export function MapTerrain(props: { showTerrain: boolean }) {
  const map = useMap();
  const origTerrain = useRef<TerrainSpecification>();

  const setTerrain = () => {
    if (!origTerrain.current) return;

    if (props.showTerrain) {
      map.current?.getMap().setTerrain(origTerrain.current);
    } else {
      map.current?.getMap().setTerrain(undefined);
    }
  };

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const handler = () => {
      origTerrain.current = instance.getMap().getTerrain()!;
      setTerrain();
    };

    instance.once('load', handler);
    return () => {
      instance.off('load', handler);
    };
  }, []);

  useEffect(() => {
    setTerrain();
  }, [props.showTerrain]);

  return false;
}
