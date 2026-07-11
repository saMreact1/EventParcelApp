import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DiscountService, Discount } from '../../core/services/discount.service';
import { EventService } from '../../core/services/event.service';
import { EventSummary } from '../../core/models/event';
import { ConfirmService } from '../../shared/services/confirm.service';

@Component({
  selector: 'app-discounts-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './discounts-page.html',
  styleUrl: './discounts-page.scss',
})
export class DiscountsPage implements OnInit {
  private readonly discountService = inject(DiscountService);
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  protected readonly events = signal<EventSummary[]>([]);
  protected readonly selectedEventId = signal<number | null>(null);
  protected readonly discounts = signal<Discount[]>([]);
  protected readonly loading = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly showAddForm = signal(false);
  protected readonly adding = signal(false);

  protected readonly discountForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    type: ['PERCENT', Validators.required],
    value: [0, [Validators.required, Validators.min(0.01)]],
    maxUses: [null as number | null],
    expiresAt: [''],
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.eventService.listEvents(0, 100).subscribe({
      next: (res) => {
        this.events.set(res.content);
        if (res.content.length > 0 && !this.selectedEventId()) {
          this.selectedEventId.set(res.content[0].id);
          this.loadDiscounts();
        }
      },
      error: () => {},
    });
  }

  protected loadDiscounts(): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.loading.set(true);
    this.discountService.listDiscounts(eventId).subscribe({
      next: (discounts) => { this.discounts.set(discounts); this.loading.set(false); },
      error: () => { this.discounts.set([]); this.loading.set(false); },
    });
  }

  protected onEventChange(eventId: number): void {
    this.selectedEventId.set(eventId);
    this.loadDiscounts();
  }

  protected addDiscount(): void {
    if (this.discountForm.invalid) return;
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.adding.set(true);
    const val = this.discountForm.value;
    const payload: any = {
      code: val.code!,
      type: val.type!,
      value: val.value!,
    };
    if (val.maxUses) payload.maxUses = val.maxUses;
    if (val.expiresAt) payload.expiresAt = val.expiresAt;
    this.discountService.createDiscount(eventId, payload).subscribe({
      next: () => {
        this.showAddForm.set(false);
        this.discountForm.reset({ type: 'PERCENT', value: 0 });
        this.adding.set(false);
        this.loadDiscounts();
      },
      error: () => this.adding.set(false),
    });
  }

  protected toggleDiscount(discount: Discount): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.discountService.toggleActive(eventId, discount.id).subscribe({
      next: () => this.loadDiscounts(),
    });
  }

  protected async deleteDiscount(discount: Discount): Promise<void> {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    const ok = await this.confirm.confirm({
      title: 'Delete Discount',
      message: `Delete discount code "${discount.code}"? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) {
      this.discountService.deleteDiscount(eventId, discount.id).subscribe({
        next: () => this.loadDiscounts(),
      });
    }
  }

  protected filteredDiscounts(): Discount[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.discounts();
    return this.discounts().filter(d =>
      d.code.toLowerCase().includes(query) ||
      d.type.toLowerCase().includes(query) ||
      d.eventTitle.toLowerCase().includes(query)
    );
  }

  protected formatValue(discount: Discount): string {
    if (discount.type === 'PERCENT') return `${discount.value}%`;
    return `₦${discount.value.toLocaleString()}`;
  }

  protected typeBadgeClass(type: string): string {
    return type === 'PERCENT' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700';
  }

  protected openAddForm(): void {
    this.discountForm.reset({ type: 'PERCENT', value: 0, code: '', maxUses: null, expiresAt: '' });
    this.showAddForm.set(true);
  }
}
