import { extendTheme } from '@chakra-ui/react';
import { createColorPalette } from './color-palette';

const theme = {
  colors: {
    primary: createColorPalette('#1E7BC6'),
    secondary: createColorPalette('#5FAD56'),
    base: createColorPalette('#2B2D42'),
    danger: createColorPalette('#D65108'),
    warning: createColorPalette('#EFA00B'),
    success: createColorPalette('#5FAD56'),
    info: createColorPalette('#1E7BC6'),
    surface: createColorPalette('#FFF')
  },
  fonts: {
    body: 'Red Hat Text, serif',
    heading: 'Red Hat Display, sans-serif'
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '1.75rem',
    '2xl': '2rem',
    '3xl': '2.25rem',
    '4xl': '2.5rem',
    '5xl': '2.75rem',
    '6xl': '3rem',
    '7xl': '3.25rem',
    '8xl': '3.5rem',
    '9xl': '3.75rem',
    '10xl': '4rem'
  },
  styles: {
    global: {
      body: {
        fontSize: ['sm', null, null, 'md'],
        color: 'base.500',
        mW: '100vw',
        overflowX: 'hidden'
      },
      '*': {
        lineHeight: 'calc(0.5rem + 1em)'
      }
    }
  },
  textStyles: {
    lead: {
      sm: {
        fontSize: 'md'
      },
      lg: {
        fontSize: 'lg'
      }
    }
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: '700'
      },
      sizes: {
        xs: {
          fontSize: ['xs', null, null, 'sm'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        sm: {
          fontSize: ['sm', null, null, 'md'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        md: {
          fontSize: ['md', null, null, 'lg'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        lg: {
          fontSize: ['lg', null, null, 'xl'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        xl: {
          fontSize: ['xl', null, null, '2xl'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        '2xl': {
          fontSize: ['2xl', null, null, '3xl'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        '3xl': {
          fontSize: ['3xl', null, null, '4xl'],
          lineHeight: 'calc(0.5rem + 1em)'
        },
        '4xl': {
          fontSize: ['4xl', null, null, '5xl'],
          lineHeight: 'calc(0.5rem + 1em)'
        }
      }
    },
    Link: {
      baseStyle: {
        color: 'primary.500'
      }
    },
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        borderRadius: 'sm',
        heading: 'Red Hat Text, serif',
        fontWeight: '600'
      },
      sizes: {
        xs: {
          fontSize: 'xs'
        },
        sm: {
          fontSize: 'xs'
        },
        md: {
          fontSize: 'sm'
        },
        lg: {
          fontSize: 'sm'
        }
      },
      variants: {
        outline: {
          border: '2px solid',
          '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
            { marginEnd: '-2px' },
          '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
            { marginBottom: '-2px' }
        },
        'soft-outline': (props) => {
          const { colorScheme: c } = props;
          return {
            border: '2px solid',
            borderColor: `${c}.200a`,
            '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
              { marginEnd: '-2px' },
            '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
              { marginBottom: '-2px' },
            _hover: {
              bg: `${c}.50a`
            },
            _active: {
              bg: `${c}.100a`
            }
          };
        }
      }
    }
  }
};

export default extendTheme(theme);
