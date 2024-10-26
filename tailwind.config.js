module.exports = {
  purge: false,
  variants: {
    zIndex: ['responsive', 'hover'],
    position: ['responsive', 'hover'],
    padding: ['responsive', 'last'],
    margin: ['responsive', 'last'],
    borderWidth: ['responsive', 'last']
  },
  theme: {
    extend: {
      colors: {
        theme: {
          1: '#1C3FAA',
          2: '#F1F5F8',
          3: '#2e51bb',
          4: '#3151BC',
          5: '#dee7ef',
          6: '#D32929',
          7: '#365A74',
          8: '#D2DFEA',
          9: '#91C714',
          10: '#3160D8',
          11: '#F78B00',
          12: '#FBC500',
          13: '#7F9EB9',
          14: '#E6F3FF',
          15: '#8DA9BE',
          16: '#607F96',
          17: '#FFEFD9',
          18: '#D8F8BC',
          19: '#E6F3FF',
          20: '#2449AF',
          21: '#284EB2',
          22: '#395EC1',
          23: '#D6E1FF',
          24: '#2e51bb',
          25: '#C6D4FD',
          26: '#E8EEFF',
          27: '#98AFF5',
          28: '#1A389F',
          29: '#142C91',
          30: '#8da3e6',
          31: '#ffd8d8',
          32: '#3b5998',
          33: '#4ab3f4',
          34: '#517fa4',
          35: '#0077b5',
          36: '#d18d96',
          37: '#c7d2ff',
          38: '#15329A',
          40: '#203FAD',
          41: '#BBC8FD',
          // customizattion colors + 100
          101: '#0999BF',
          102: '#F1F5F8',
          //103: '#BA2F2F',Ancien couleur agissant sur les icons
          103: '#A8A9AC',
          //104: '#A33E3E',Ancien couleur agissant sur les hovers des menu inactifs
          104: '#A8A9AC',
          105: '#dee7ef',
          //106: '#D32929',Ancienne couleur
          106: '#0999BF',
          107: '#365A74',
          108: '#D2DFEA',
          109: '#91C714',

          110: '#D63232',
          113: '#B78080',
          114: '#FFE9E9',
          115: '#BC8E8E',
          116: '#936060',
          117: '#FFEFD9',
          118: '#D8F8BC',
          119: '#E6F3FF',

          120: '#AD2525',
          122: '#BF3A3A',
          123: '#FFD9D9',
          124: '#BA2F2F',
          125: '#FCC8C8',
          126: '#FFEBEB',
          127: '#F49A9A',
          //128: '#962424',Ancienne couleur agissant sur les menus deroules
          128: '#0999BF',
          //129: '#872A2A',
          129: '#0999BF',

          130: '#8da3e6',
          131: '#ffd8d8',
          132: '#3b5998',
          133: '#4ab3f4',
          134: '#517fa4',
          135: '#0077b5',
          136: '#d18d96',
         // 137: '#ffcaca',
          137: '#F1F5F8',
          138: '#0999BF',

         // 140: '#AA2121',Ancienne couleur deconnexion
          140: '#A8A9AC',
          141: '#F1F5F8',

          150: '#',

          161: '#9B2C2C',
          162: '#F1F5F8',
          163: '#BA2F2F',
          164: '#A33E3E',
          165: '#dee7ef',
          166: '#D32929',
          167: '#365A74',
          168: '#D2DFEA',
          169: '#91C714',
        }
      },
      fontFamily: {
        'roboto': ['Roboto']
      },
      container: {
        center: true
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%'
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        'xxl': '1600px'
        /*
        'sm': {'min': '640px', 'max': '767px'},
        'md': {'min': '768px', 'max': '1023px'},
        'lg': {'min': '1024px', 'max': '1279px'},
        'xl': {'min': '1280px', 'max': '1599px'},
        'xxl': {'min': '1600px'},*/
      }
    }
  }
}
