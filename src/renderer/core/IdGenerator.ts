let counter = 0;

export function generateId(prefix: string): string {
  counter++;
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${String(counter).padStart(3, '0')}_${rand}`;
}

export function resetIdCounter(): void {
  counter = 0;
}
