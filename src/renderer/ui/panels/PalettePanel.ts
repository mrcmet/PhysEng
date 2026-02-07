import type { PrimitiveType } from '../../physics/primitives/Primitive';

interface PaletteItem {
  type: PrimitiveType;
  label: string;
  icon: string; // SVG path content
}

const ITEMS: PaletteItem[] = [
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: '<rect x="4" y="6" width="16" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
  {
    type: 'ground',
    label: 'Ground',
    icon: '<line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="2"/><line x1="4" y1="18" x2="2" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="18" x2="6" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="18" x2="10" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="18" x2="14" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="18" x2="18" y2="16" stroke="currentColor" stroke-width="1.5"/>',
  },
];

export class PalettePanel {
  private container: HTMLElement;
  private onSelect: (type: PrimitiveType) => void;
  private activeType: PrimitiveType | null = null;
  private buttons = new Map<PrimitiveType, HTMLButtonElement>();

  constructor(container: HTMLElement, onSelect: (type: PrimitiveType) => void) {
    this.container = container;
    this.onSelect = onSelect;
    this.build();
  }

  private build(): void {
    // Clear existing placeholder content
    this.container.innerHTML = '';

    const label = document.createElement('span');
    label.className = 'text-[10px] text-gray-500 mb-1 select-none';
    label.textContent = 'Place';
    this.container.appendChild(label);

    for (const item of ITEMS) {
      const btn = document.createElement('button');
      btn.className = 'w-10 h-10 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors';
      btn.title = item.label;
      btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${item.icon}</svg>`;

      btn.addEventListener('click', () => {
        this.setActive(item.type);
        this.onSelect(item.type);
      });

      this.container.appendChild(btn);
      this.buttons.set(item.type, btn);
    }
  }

  setActive(type: PrimitiveType | null): void {
    this.activeType = type;
    for (const [t, btn] of this.buttons) {
      if (t === type) {
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
