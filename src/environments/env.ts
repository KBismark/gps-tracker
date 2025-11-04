
const MAP_API_KEY = '<PLACE_MAPTILER_API_KEY_HERE>'
const CUSTOM_MAP_STYLES = ' https://api.maptiler.com/maps/streets-v4/style.json';
export const environment = {
    MAP_API_KEY,
    CUSTOM_MAP_STYLES: `${CUSTOM_MAP_STYLES}?key=${MAP_API_KEY}`
  };

  // 019782df-77d7-7a97-9526-489861c68aef - proximity
  // 019845b4-c059-71e3-8f7c-0edbc0045126 - street001
