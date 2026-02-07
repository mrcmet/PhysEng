import type { EventBus } from '../core/EventBus';
import type { AppState } from '../core/AppState';

export class SelectionManager {
  private appState: AppState;
  private eventBus: EventBus;

  constructor(appState: AppState, eventBus: EventBus) {
    this.appState = appState;
    this.eventBus = eventBus;
  }

  select(id: string): void {
    this.appState.selectedIds.clear();
    this.appState.selectedIds.add(id);
    this.emitChanged();
  }

  addToSelection(id: string): void {
    this.appState.selectedIds.add(id);
    this.emitChanged();
  }

  toggleSelection(id: string): void {
    if (this.appState.selectedIds.has(id)) {
      this.appState.selectedIds.delete(id);
    } else {
      this.appState.selectedIds.add(id);
    }
    this.emitChanged();
  }

  clearSelection(): void {
    if (this.appState.selectedIds.size > 0) {
      this.appState.selectedIds.clear();
      this.emitChanged();
    }
  }

  getSelectedIds(): string[] {
    return Array.from(this.appState.selectedIds);
  }

  hasSelection(): boolean {
    return this.appState.selectedIds.size > 0;
  }

  private emitChanged(): void {
    this.eventBus.emit('selection:changed', { selected: this.getSelectedIds() });
  }
}
