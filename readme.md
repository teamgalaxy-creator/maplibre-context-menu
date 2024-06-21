# MapLibre Context Menu

A context menu plugin for MapLibre that provides a customizable context menu with common map operations such as zooming in, zooming out, centering the map, adding markers, and querying features. Additionally, it supports custom menu items.

## Features

- **Zoom In/Out**: Zoom in and out using the context menu.
- **Center Map**: Center the map at the clicked location.
- **Add Marker**: Add a marker at the clicked location.
- **Remove Marker**: Remove a specific marker by right-clicking on it.
- **Query Features**: Query features at the clicked location.
- **Custom Menu Items**: Add custom menu items to the context menu.

## Installation

Install the plugin via npm:

```sh
npm install maplibre-context-menu
```

<!-- Quick Usage -->

## Quick Usage

To use the context menu, you need to create an instance of the `MapLibreContextMenu` class and pass it the map instance. The context menu will automatically be displayed when you right-click on the map.

```js
import maplibregl from 'maplibre-gl';
import MapLibreContextMenu from 'maplibre-context-menu';

import 'maplibre-gl/dist/maplibre-gl.css'

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

new MapLibreContextMenu(map);
```

<!-- Custom Menu Items -->
## Custom Menu Items

You can add custom menu items to the context menu by providing an array of custom items when creating the `MapLibreContextMenu` instance. Each custom item should have the following properties:

- `action`: A unique identifier for the custom action.
- `label`: The label to display in the context menu.
- `handler`: A function that will be called when the custom item is clicked. The function will receive the coordinates of the clicked location as an argument.

To use the context menu, you need to create an instance of the `MapLibreContextMenu` class and pass it the map instance. The context menu will automatically be displayed when you right-click on the map.

```js

import maplibregl from 'maplibre-gl';
import MapLibreContextMenu from 'maplibre-context-menu';

import 'maplibre-gl/dist/maplibre-gl.css'

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
```

