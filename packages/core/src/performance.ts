export type PerformanceEntry = PerformanceMark | PerformanceMeasure;
export type PerformanceEntryType = PerformanceEntry['entryType'];

export type PerformanceMark = {
  entryType: 'mark';
  name: string;
  startTime: number;
  detail?: any;
};

export type PerformanceMeasure = {
  entryType: 'measure';
  name: string;
  startTime: number;
  duration: number;
};

export class PerformanceTimeline {
  private marks: PerformanceMark[] = [];
  private measures: PerformanceMeasure[] = [];
  private marksTimes: Map<string, number> = new Map();

  readonly timingOrigin: number;

  constructor() {
    this.timingOrigin = performance.now();
  }

  mark(name: string): void {
    const startTime = performance.now();
    const entry: PerformanceMark = {
      entryType: 'mark',
      name,
      startTime,
    };

    this.marks.push(entry);
    this.marksTimes.set(name, startTime);
  }

  measure(name: string, startMark: string, endMark?: string): void {
    const endTime = this._resolveMark(endMark, performance.now());
    const startTime = this._resolveMark(startMark, this.timingOrigin);
    const entry: PerformanceMeasure = {
      entryType: 'measure',
      name,
      duration: endTime - startTime,
      startTime,
    };

    this.measures.push(entry);
  }

  markStart(name: string): void {
    this.mark(`${name}:start`);
  }

  markEnd(name: string): void {
    this.mark(`${name}:end`);
    this.measure(name, `${name}:start`, `${name}:end`);
  }

  getMarks(): PerformanceMark[] {
    return this.marks;
  }

  getMeasures(): PerformanceMeasure[] {
    return this.measures;
  }

  getMeasureTotal(name: string): number {
    const measures = this.measures.filter((measure) => measure.name === name);
    return measures.reduce((total, measure) => total + measure.duration, 0);
  }

  toJSON(): Record<string, unknown> {
    return {
      marks: [...this.marks],
      measures: [...this.measures],
    };
  }

  private _resolveMark(mark: string | undefined, defaultValue: number): number {
    if (mark === undefined) {
      return defaultValue;
    }

    const markTime = this.marksTimes.get(mark);
    if (markTime == null) {
      console.warn(`Performance mark "${mark}" not found, using default value`);
      return defaultValue;
    }

    return markTime;
  }
}
