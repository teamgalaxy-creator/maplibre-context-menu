import maplibregl from 'maplibre-gl';
import ContextMenuItem from './ContextMenuItem';
import { icons } from './icons';

interface ContextMenuOptions {
    customItems?: ContextMenuItem[];
}

class ContextMenu {
    private map: maplibregl.Map;
    private options: ContextMenuOptions;
    private contextMenu: HTMLDivElement;
    private currentCoords: maplibregl.LngLat | undefined;
    private markers: maplibregl.Marker[];
    private isContextMenuOpen: boolean = false;

    constructor(map: maplibregl.Map, options: ContextMenuOptions = {}) {
        this.map = map;
        this.options = options;
        this.markers = [];
        this.injectStyles();
        this.contextMenu = this.createContextMenu();
        this.map.getContainer().addEventListener('contextmenu', this.showContextMenu.bind(this));
        document.body.addEventListener('click', this.hideContextMenu.bind(this));

        // Add event listener for right-click on markers
        this.map.on('contextmenu', 'marker', (e) => {
            if (!e.features || e.features.length === 0) return;
            this.showContextMenu(e.originalEvent, true, e.features[0]);
        });
    }

    private injectStyles(): void {
        const styles = `
      .maplibre-context-menu {
        display: none;
        position: absolute;
        z-index: 1000;
        background-color: #fff;
        border: 1px solid #ccc;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: Arial, sans-serif;
      }
      .maplibre-context-menu.show {
        display: block;
        opacity: 1;
      }
      .maplibre-context-menu.hide {
        opacity: 0;
      }
      .context-menu-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .context-menu-item {
        padding: 8px 12px;
        cursor: pointer;
      }
      .context-menu-item:hover {
        background-color: #f0f0f0;
      }
      .context-menu-coords {
        cursor: pointer;
        padding: 8px 12px;
        font-weight: bold;
        color: #333;
      }
      .context-menu-icons {
        display: flex;
        justify-content: space-between;
        padding: 8px;
      }
      .context-menu-icon {
        width: 24px;
        height: 24px;
        cursor: pointer;
        padding: 4px;
      }
        .context-menu-icon:hover {
        background-color: #f0f0f0;
        }
    `;
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    private createContextMenu(): HTMLDivElement {
        const menu = document.createElement('div');
        menu.className = 'maplibre-context-menu';
        menu.innerHTML = `
      <div class="context-menu-icons">
        <div class="context-menu-icon" data-action="zoomIn">${icons.zoomIn}</div>
        <div class="context-menu-icon" data-action="zoomOut">${icons.zoomOut}</div>
        <div class="context-menu-icon" data-action="centerMap">${icons.center}</div>
      </div>
      <ul class="context-menu-list">
        <li class="context-menu-coords"></li>
        <li class="context-menu-item" data-action="addMarker">Add Marker Here</li>
        <li class="context-menu-item context-menu-remove-marker" data-action="removeMarker">Remove Marker</li>
        <li class="context-menu-item" data-action="queryFeatures">Query Features</li>
        ${this.options.customItems ? this.options.customItems.map(item => `<li class="context-menu-item" data-action="${item.action}">${item.label}</li>`).join('') : ''}
      </ul>
    `;
        document.body.appendChild(menu);

        menu.addEventListener('click', (e) => {
            if (e.target instanceof HTMLElement) {
                const action = e.target.getAttribute('data-action');
                this.handleMenuItemClick(action!);
            }
        });

        return menu;
    }

    private showContextMenu(e: MouseEvent, isMarkerContext: boolean = false, feature?: maplibregl.MapGeoJSONFeature): void {
        e.preventDefault();

        // Ensure only one context menu is shown
        if (this.isContextMenuOpen) {
            this.hideContextMenu();
        }

        const x = e.clientX;
        const y = e.clientY;
        const coords = this.map.unproject([x, y]);

        // Calculate the best position for the context menu
        const menuWidth = 150; // approximate width of the context menu
        const menuHeight = 200; // approximate height of the context menu
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let left = x;
        let top = y;

        if (x + menuWidth > windowWidth) {
            left = windowWidth - menuWidth - 10;
        }
        if (y + menuHeight > windowHeight) {
            top = windowHeight - menuHeight - 10;
        }

        this.contextMenu.style.left = `${left}px`;
        this.contextMenu.style.top = `${top}px`;
        this.contextMenu.style.display = 'block'; // Ensure the menu is displayed

        // Remove any existing animation classes
        this.contextMenu.classList.remove('hide');

        // Trigger a reflow to restart the animation
        void this.contextMenu.offsetWidth;

        // Add the show class to animate the menu in
        this.contextMenu.classList.add('show');

        this.currentCoords = coords;
        this.isContextMenuOpen = true; // Set flag to true when menu is shown

        const coordsElement = this.contextMenu.querySelector('.context-menu-coords');
        if (coordsElement) {
            coordsElement.textContent = `Copy ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        }

        const removeMarkerItem = this.contextMenu.querySelector('.context-menu-remove-marker') as HTMLLIElement;
        if (removeMarkerItem) {
            removeMarkerItem.style.display = isMarkerContext ? 'block' : 'none';
            if (isMarkerContext && feature) {
                removeMarkerItem.setAttribute('data-marker-id', feature.id as string);
            } else {
                removeMarkerItem.removeAttribute('data-marker-id');
            }
        }
    }

    private hideContextMenu(): void {
        if (!this.isContextMenuOpen) return; // Only hide if the menu is currently shown

        // Remove the show class and add the hide class to animate the menu out
        this.contextMenu.classList.remove('show');
        this.contextMenu.classList.add('hide');

        // Set a timeout to fully hide the menu after the animation
        setTimeout(() => {
            this.contextMenu.style.display = 'none';
            this.isContextMenuOpen = false; // Set flag to false when menu is hidden
        }, 300); // Match the transition duration
    }

    private handleMenuItemClick(action: string): void {
        switch (action) {
            case 'addMarker':
                this.addMarker();
                break;
            case 'removeMarker':
                this.removeMarker();
                break;
            case 'zoomIn':
                this.zoomIn();
                break;
            case 'zoomOut':
                this.zoomOut();
                break;
            case 'centerMap':
                this.centerMap();
                break;
            case 'queryFeatures':
                this.queryFeatures();
                break;
            default:
                if (this.options.customItems) {
                    const customItem = this.options.customItems.find(item => item.action === action);
                    if (customItem && customItem.handler) {
                        customItem.handler(this.currentCoords!, this.map);
                    }
                } else {
                    console.warn(`Unknown action: ${action}`);
                }
        }
        this.hideContextMenu();
    }

    private addMarker(): void {
        if (!this.currentCoords) return;
        const marker = new maplibregl.Marker()
            .setLngLat([this.currentCoords.lng, this.currentCoords.lat])
            .addTo(this.map);
        this.markers.push(marker);
    }

    private removeMarker(): void {
        const removeMarkerItem = this.contextMenu.querySelector('.context-menu-remove-marker');
        if (removeMarkerItem) {
            const markerId = removeMarkerItem.getAttribute('data-marker-id');
            if (markerId) {
                const marker = this.markers.find(m => m.getElement().id === markerId
                );
                if (marker) {
                    marker.remove();
                    this.markers = this.markers.filter(m => m !== marker);
                }
            }
        }
    }

    private zoomIn(): void {
        this.map.zoomIn();
    }

    private zoomOut(): void {
        this.map.zoomOut();
    }

    private centerMap(): void {
        if (!this.currentCoords) return;
        this.map.setCenter([this.currentCoords.lng, this.currentCoords.lat]);
    }

    private queryFeatures(): void {
        if (!this.currentCoords) return;
        const features = this.map.queryRenderedFeatures(this.map.project([this.currentCoords.lng, this.currentCoords.lat]));
        console.log(features);
        alert(`Found ${ features.length } features`);
    }
}

export default ContextMenu;