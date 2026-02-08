import type { PrimitiveType } from '../../physics/primitives/Primitive';
import type { ConnectionType } from '../../physics/connections/Connection';

interface PaletteItem {
  id: string;
  label: string;
  icon: string; // SVG path content
  group: 'primitive' | 'connection';
}

const ITEMS: PaletteItem[] = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    group: 'primitive',
    icon: '<rect x="4" y="6" width="16" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
  {
    id: 'circle',
    label: 'Circle',
    group: 'primitive',
    icon: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
  {
    id: 'ground',
    label: 'Ground',
    group: 'primitive',
    icon: '<line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="2"/><line x1="4" y1="18" x2="2" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="18" x2="6" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="18" x2="10" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="18" x2="14" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="18" x2="18" y2="16" stroke="currentColor" stroke-width="1.5"/>',
  },
  {
    id: 'spring',
    label: 'Spring',
    group: 'connection',
    icon: '<path d="M4 12 L6 12 L7 6 L9 18 L11 6 L13 18 L15 6 L17 18 L18 12 L20 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  },
  {
    id: 'damper',
    label: 'Damper',
    group: 'connection',
    icon: '<line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="7" width="8" height="10" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="21" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="9" x2="13" y2="15" stroke="currentColor" stroke-width="2"/>',
  },
  {
    id: 'revolute',
    label: 'Revolute Joint',
    group: 'connection',
    icon: '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>',
  },
  {
    id: 'weld',
    label: 'Weld Joint',
    group: 'connection',
    icon: '<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2.5"/><line x1="9" y1="8" x2="15" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="15" y1="8" x2="9" y2="16" stroke="currentColor" stroke-width="1.5"/>',
  },
];

export class PalettePanel {
  private container: HTMLElement;
  private onPrimitiveSelect: (type: PrimitiveType) => void;
  private onConnectionSelect: (type: ConnectionType) => void;
  private activeId: string | null = null;
  private buttons = new Map<string, HTMLButtonElement>();

  constructor(
    container: HTMLElement,
    onPrimitiveSelect: (type: PrimitiveType) => void,
    onConnectionSelect: (type: ConnectionType) => void,
  ) {
    this.container = container;
    this.onPrimitiveSelect = onPrimitiveSelect;
    this.onConnectionSelect = onConnectionSelect;
    this.build();
  }

  private build(): void {
    this.container.innerHTML = '';

    const placeLabel = document.createElement('span');
    placeLabel.className = 'text-[10px] text-gray-500 mb-1 select-none';
    placeLabel.textContent = 'Place';
    this.container.appendChild(placeLabel);

    // Primitive items
    for (const item of ITEMS.filter(i => i.group === 'primitive')) {
      this.addButton(item);
    }

    // Divider
    const divider = document.createElement('div');
    divider.className = 'w-8 border-t border-gray-600 my-1';
    this.container.appendChild(divider);

    const connectLabel = document.createElement('span');
    connectLabel.className = 'text-[10px] text-gray-500 mb-1 select-none';
    connectLabel.textContent = 'Connect';
    this.container.appendChild(connectLabel);

    // Connection items
    for (const item of ITEMS.filter(i => i.group === 'connection')) {
      this.addButton(item);
    }
  }

  private addButton(item: PaletteItem): void {
    const btn = document.createElement('button');
    btn.className = 'w-10 h-10 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors';
    btn.title = item.label;
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${item.icon}</svg>`;

    btn.addEventListener('click', () => {
      this.setActive(item.id);
      if (item.group === 'primitive') {
        this.onPrimitiveSelect(item.id as PrimitiveType);
      } else {
        this.onConnectionSelect(item.id as ConnectionType);
      }
    });

    this.container.appendChild(btn);
    this.buttons.set(item.id, btn);
  }

  setActive(id: string | null): void {
    this.activeId = id;
    for (const [itemId, btn] of this.buttons) {
      if (itemId === id) {
        btn.className = 'w-10 h-10 flex items-center justify-center rounded bg-blue-600 text-white transition-colors';
      } else {
        btn.className = 'w-10 h-10 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors';
      }
    }
  }

  clearActive(): void {
    this.setActive(null);
  }
}
