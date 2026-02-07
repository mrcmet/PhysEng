export class SimulationClock {
  private accumulator = 0;
  private lastTimestamp = 0;
  private simulationTime = 0;
  private speedMultiplier = 1.0;
  private started = false;

  setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  getSimulationTime(): number {
    return this.simulationTime;
  }

  /** Call each frame. Returns the number of fixed-timestep steps to perform. */
  update(timestamp: number, fixedDt: number): number {
    if (!this.started) {
      this.lastTimestamp = timestamp;
      this.started = true;
      return 0;
    }

    const elapsed = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // cap at 100ms
    this.lastTimestamp = timestamp;
    this.accumulator += elapsed * this.speedMultiplier;

    let steps = 0;
    while (this.accumulator >= fixedDt) {
      this.accumulator -= fixedDt;
      this.simulationTime += fixedDt;
      steps++;
    }

    return steps;
  }

  reset(): void {
    this.accumulator = 0;
    this.lastTimestamp = 0;
    this.simulationTime = 0;
    this.started = false;
  }

  pause(): void {
    this.started = false;
  }
}
