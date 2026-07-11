import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (confirm.isOpen()) {
      @let opts = confirm.options();
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="confirm.onCancel()">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="p-6">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                 [class]="iconBgClass(opts.variant!)">
              @if (opts.variant === 'danger') {
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
              } @else if (opts.variant === 'warning') {
                <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
              } @else {
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>
              }
            </div>
            <h3 class="text-lg font-semibold text-gray-900 text-center">{{ opts.title }}</h3>
            <p class="mt-2 text-sm text-gray-500 text-center leading-relaxed">{{ opts.message }}</p>
          </div>
          <div class="flex gap-3 border-t border-gray-100 px-6 py-4">
            <button (click)="confirm.onCancel()"
                    class="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              {{ opts.cancelText }}
            </button>
            <button (click)="confirm.onConfirm()"
                    class="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                    [class]="confirmBtnClass(opts.variant!)">
              {{ opts.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly confirm = inject(ConfirmService);

  iconBgClass(variant: string): string {
    const map: Record<string, string> = { danger: 'bg-red-100', warning: 'bg-amber-100', info: 'bg-blue-100' };
    return map[variant] ?? 'bg-red-100';
  }

  confirmBtnClass(variant: string): string {
    const map: Record<string, string> = { danger: 'bg-red-600 hover:bg-red-700', warning: 'bg-amber-600 hover:bg-amber-700', info: 'bg-blue-600 hover:bg-blue-700' };
    return map[variant] ?? 'bg-red-600 hover:bg-red-700';
  }
}
