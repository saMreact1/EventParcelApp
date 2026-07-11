import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import {
  TransactionSummary,
  TransactionStats,
} from '../../core/models/event';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './transactions-page.html',
  styleUrl: './transactions-page.scss',
})
export class TransactionsPage implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal('');
  protected readonly transactions = signal<TransactionSummary[]>([]);
  protected readonly stats = signal<TransactionStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly pageSize = signal(6);
  protected readonly expandedIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadStats();
    this.loadTransactions();
  }

  protected loadStats(): void {
    this.transactionService.getStats().subscribe({
      next: (res) => this.stats.set(res),
      error: () => {},
    });
  }

  protected loadTransactions(): void {
    this.loading.set(true);
    this.transactionService
      .listTransactions(this.currentPage(), this.pageSize(), this.searchQuery() || undefined)
      .subscribe({
        next: (res) => {
          this.transactions.set(res.content);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.transactions.set([]);
          this.loading.set(false);
        },
      });
  }

  protected onSearch(): void {
    this.currentPage.set(0);
    this.loadTransactions();
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.loadTransactions();
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => Math.max(0, p - 1));
      this.loadTransactions();
    }
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadTransactions();
  }

  protected toggleBreakdown(id: number): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  protected navigateToOrder(orderCode: string): void {
    this.router.navigate(['/dashboard/orders', orderCode]);
  }

  protected formatCurrency(amount: number): string {
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(2)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  }

  protected formatUsd(amount: number): string {
    return `$${amount.toFixed(2)} in Dollar`;
  }

  protected exportCsv(): void {
    const rows = this.transactions();
    const headers = [
      'Order Code',
      'Event',
      'Guest',
      'Guest Payment',
      'Amount Received',
      'Platform Fee',
      'Status',
      'Date',
    ];
    const csvRows = [headers.join(',')];

    for (const t of rows) {
      csvRows.push(
        [
          `"${t.orderCode}"`,
          `"${(t.eventTitle || '').replace(/"/g, '""')}"`,
          `"${(t.guestName || '').replace(/"/g, '""')}"`,
          t.guestPayment,
          t.amountReceived,
          t.platformFee,
          t.paymentStatus,
          `"${t.createdAt}"`,
        ].join(',')
      );
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(0, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (end - start < 2) {
      if (start === 0) {
        end = Math.min(2, total - 1);
      } else {
        start = Math.max(0, end - 2);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadTransactions();
  }
}
