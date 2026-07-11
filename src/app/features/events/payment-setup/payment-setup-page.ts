import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { BankService, BankInfo } from '../../../core/services/bank.service';

@Component({
  selector: 'app-payment-setup-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './payment-setup-page.html',
  styleUrl: './payment-setup-page.scss',
})
export class PaymentSetupPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly bankService = inject(BankService);
  private readonly fb = inject(FormBuilder);

  protected readonly eventId = signal<number>(0);









  protected readonly isSubmitting = signal(false);
  protected readonly banks = signal<BankInfo[]>([]);
  protected readonly filteredBanks = signal<BankInfo[]>([]);
  protected readonly showBankDropdown = signal(false);
  protected readonly isResolving = signal(false);
  protected readonly resolveError = signal<string | null>(null);
  protected bankSearch = '';

  protected readonly paymentForm = this.fb.group({
    accountNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    bankCode: ['', [Validators.required]],
    bankName: ['', [Validators.required]],
    accountName: [{ value: '', disabled: true }, [Validators.required]],
    paymentDeadlineDate: ['', [Validators.required]],
    paymentDeadlineTime: ['', [Validators.required]],
    timezone: ['WAT'],
  });

  private resolveTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('eventId'));
    this.eventId.set(id);
    this.loadBanks();
  }

  private loadBanks(): void {
    this.bankService.listBanks().subscribe({
      next: (banks) => {
        this.banks.set(banks);
        this.filteredBanks.set(banks);
      },
      error: () => {},
    });
  }

  onBankSearch(): void {
    const query = this.bankSearch.toLowerCase();
    if (!query) {
      this.filteredBanks.set(this.banks());
      return;
    }
    this.filteredBanks.set(
      this.banks().filter(b => b.name.toLowerCase().includes(query) || b.code.includes(query))
    );
  }

  selectBank(bank: BankInfo): void {
    this.paymentForm.patchValue({
      bankCode: bank.code,
      bankName: bank.name,
    });
    this.bankSearch = bank.name;
    this.showBankDropdown.set(false);
    this.paymentForm.get('accountName')?.reset();
    this.resolveError.set(null);
    this.tryResolveAccount();
  }

  onAccountNumberInput(): void {
    const accountNumber = this.paymentForm.get('accountNumber')?.value;
    const bankCode = this.paymentForm.get('bankCode')?.value;
    if (accountNumber?.length === 10 && bankCode) {
      this.tryResolveAccount();
    }
  }

  private tryResolveAccount(): void {
    const accountNumber = this.paymentForm.get('accountNumber')?.value;
    const bankCode = this.paymentForm.get('bankCode')?.value;

    if (!accountNumber || accountNumber.length !== 10 || !bankCode) return;

    this.isResolving.set(true);
    this.resolveError.set(null);

    if (this.resolveTimeout) clearTimeout(this.resolveTimeout);

    this.resolveTimeout = setTimeout(() => {
      this.bankService.resolveAccount(accountNumber, bankCode).subscribe({
        next: (result) => {
          this.paymentForm.get('accountName')?.setValue(result.accountName);
          this.paymentForm.get('accountName')?.enable();
          this.isResolving.set(false);
        },
        error: (err) => {
          this.paymentForm.get('accountName')?.setValue('');
          this.resolveError.set(err?.error?.message || 'Could not resolve account name');
          this.isResolving.set(false);
        },
      });
    }, 500);
  }

  toggleBankDropdown(): void {
    this.showBankDropdown.set(!this.showBankDropdown());
    if (this.showBankDropdown()) {
      this.bankSearch = '';
      this.filteredBanks.set(this.banks());
    }
  }

  closeBankDropdown(): void {
    setTimeout(() => this.showBankDropdown.set(false), 200);
  }

  protected onSubmit(): void {
    if (this.paymentForm.invalid) return;
    this.isSubmitting.set(true);
    const val = this.paymentForm.getRawValue();
    this.eventService.savePaymentSetup(this.eventId(), {
      accountNumber: val.accountNumber || undefined,
      bankName: val.bankName || undefined,
      accountName: val.accountName || undefined,
      paymentDeadlineDate: val.paymentDeadlineDate || undefined,
      paymentDeadlineTime: val.paymentDeadlineTime || undefined,
      timezone: val.timezone || undefined,
    }).subscribe({
      next: () => { this.router.navigate(['/dashboard/events', this.eventId(), 'pickup-details']); this.isSubmitting.set(false); },
      error: () => this.isSubmitting.set(false),
    });
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/events', this.eventId(), 'groups']);
  }
}
