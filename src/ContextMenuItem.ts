import maplibregl from 'maplibre-gl';

interface ContextMenuItem {
  action: string;
  label: string;
  handler?: (coords: maplibregl.LngLat, map: maplibregl.Map) => void;
}

export default ContextMenuItem;