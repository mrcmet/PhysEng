export class Layout {
  readonly root: HTMLElement;
  readonly toolbar: HTMLElement;
  readonly palette: HTMLElement;
  readonly canvasContainer: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly propertiesPanel: HTMLElement;
  readonly graphPanel: HTMLElement;
  readonly playbackBar: HTMLElement;

  constructor(appElement: HTMLElement) {
    this.root = appElement;
    this.root.innerHTML = '';

    // Toolbar
    this.toolbar = this.el('div',
      'flex items-center h-10 px-3 bg-gray-800 border-b border-gray-700 text-sm gap-2 shrink-0');
    this.toolbar.innerHTML = `
      <span class="font-semibold text-blue-400 tracking-wide">PhysEng</span>
      <span class="text-gray-500 mx-2">|</span>
      <span class="text-gray-400 text-xs">Engineering Physics Simulator</span>
    `;

    // Main content area (palette + workspace + properties)
    const mainArea = this.el('div', 'flex flex-1 min-h-0');

    // Palette (left sidebar)
    this.palette = this.el('div',
      'w-14 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-1 shrink-0');
    this.palette.innerHTML = `<span class="text-[10px] text-gray-500 mb-1">Tools</span>`;

    // Center: canvas + graph
    const centerColumn = this.el('div', 'flex flex-col flex-1 min-w-0');

    // Canvas container
    this.canvasContainer = this.el('div', 'flex-1 relative min-h-0');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'absolute inset-0 w-full h-full';
    this.canvasContainer.appendChild(this.canvas);

    // Graph panel (collapsible, starts hidden)
    this.graphPanel = this.el('div',
      'h-0 bg-gray-850 border-t border-gray-700 overflow-hidden');

    centerColumn.appendChild(this.canvasContainer);
    centerColumn.appendChild(this.graphPanel);

    // Properties panel (right sidebar)
    this.propertiesPanel = this.el('div',
      'w-56 bg-gray-800 border-l border-gray-700 p-3 overflow-y-auto shrink-0');
    this.propertiesPanel.innerHTML = `
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h3>
      <p class="text-xs text-gray-500">No selection</p>
    `;

    mainArea.appendChild(this.palette);
    mainArea.appendChild(centerColumn);
    mainArea.appendChild(this.propertiesPanel);

    // Playback bar (bottom)
    this.playbackBar = this.el('div',
      'flex items-center h-10 px-4 bg-gray-800 border-t border-gray-700 text-xs gap-3 shrink-0');
    this.playbackBar.innerHTML = `
      <span class="text-gray-500">Playback controls will appear here</span>
    `;

    // Assemble
    this.root.appendChild(this.toolbar);
    this.root.appendChild(mainArea);
    this.root.appendChild(this.playbackBar);
  }

  private el(tag: string, classes: string): HTMLElement {
    const element = document.createElement(tag);
    element.className = classes;
    return element;
  }
}
