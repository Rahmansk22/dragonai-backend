export class MemoryAgent {
  private memory: Record<string, any>[] = [];
  add(item: Record<string, any>) { this.memory.push(item); }
  query(_q: string) { return this.memory; }
}
