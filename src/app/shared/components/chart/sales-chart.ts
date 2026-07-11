import { Component, input, signal, computed, ElementRef, inject } from '@angular/core';

export interface ChartDataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  templateUrl: './sales-chart.html',
  styleUrl: './sales-chart.scss',
})
export class SalesChart {
  private readonly el = inject(ElementRef);

  readonly data = input.required<ChartDataPoint[]>();

  protected readonly hoveredIndex = signal<number | null>(null);
  protected readonly tooltipLeft = signal<number>(0);
  protected readonly tooltipTop = signal<number>(0);

  protected readonly svgWidth = 800;
  protected readonly svgHeight = 220;
  protected readonly chartTop = 20;
  protected readonly chartBottom = 170;
  protected readonly leftPad = 55;
  protected readonly rightPad = 30;

  get chartHeight(): number {
    return this.chartBottom - this.chartTop;
  }

  get maxValue(): number {
    return Math.max(...this.data().map(d => d.value), 1);
  }

  get niceMax(): number {
    const m = this.maxValue;
    if (m <= 100) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(m)));
    const residual = m / magnitude;
    let nice: number;
    if (residual <= 1.5) nice = 1.5 * magnitude;
    else if (residual <= 2) nice = 2 * magnitude;
    else if (residual <= 3) nice = 3 * magnitude;
    else if (residual <= 5) nice = 5 * magnitude;
    else if (residual <= 7.5) nice = 7.5 * magnitude;
    else nice = 10 * magnitude;
    return Math.ceil(nice);
  }

  protected readonly yTicks = computed(() => {
    const max = this.niceMax;
    const steps = 4;
    const ticks: { value: number; y: number; label: string }[] = [];
    for (let i = 0; i <= steps; i++) {
      const value = (max / steps) * i;
      ticks.push({
        value,
        y: this.getY(value),
        label: this.formatCompact(value),
      });
    }
    return ticks;
  });

  protected formatCompact(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return String(Math.round(value));
  }

  get pointCount(): number {
    return this.data().length;
  }

  get stepX(): number {
    const usable = this.svgWidth - this.leftPad - this.rightPad;
    return usable / Math.max(this.pointCount - 1, 1);
  }

  protected getX(index: number): number {
    return this.leftPad + index * this.stepX;
  }

  protected getY(value: number): number {
    if (this.niceMax === 0) return this.chartBottom;
    return this.chartBottom - (value / this.niceMax) * this.chartHeight;
  }

  protected readonly points = computed(() => {
    return this.data().map((d, i) => ({
      x: this.getX(i),
      y: this.getY(d.value),
      label: d.label,
      value: d.value,
    }));
  });

  protected readonly linePath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';
    return this.buildSmoothPath(pts);
  });

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';
    const line = this.buildSmoothPath(pts);
    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    return `${line} L ${lastX} ${this.chartBottom} L ${firstX} ${this.chartBottom} Z`;
  });

  private buildSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  protected onPointEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex.set(index);
    this.updateTooltipPosition(event);
  }

  protected onMouseMove(event: MouseEvent): void {
    if (this.hoveredIndex() === null) return;
    this.updateTooltipPosition(event);
  }

  protected onPointLeave(): void {
    this.hoveredIndex.set(null);
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  }

  private updateTooltipPosition(event: MouseEvent): void {
    const container = this.el.nativeElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const relX = event.clientX - containerRect.left;
    const relY = event.clientY - containerRect.top;
    this.tooltipLeft.set(relX + 16);
    this.tooltipTop.set(relY - 10);
  }
}
