import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'
import {ContextMenu} from '.';


const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

new ContextMenu(map, {
  customItems: [
    {
      action: 'customAction',
      label: 'Custom Action',
      handler: (coords) => {
        console.log(`Custom action at ${coords}`);
      }
    }
  ]
});
