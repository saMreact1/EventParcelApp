import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ─── Hero Section ─── -->
    <section class="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/5">
      <div class="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-28">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Hero Text -->
          <div class="max-w-xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <span class="h-2 w-2 rounded-full bg-secondary"></span>
              <span class="body-xs font-semibold text-primary">Trusted by 1,000+ event hosts</span>
            </div>
            <h1 class="heading-1 text-text-primary mb-4">
              Stress-free
              <span class="text-primary">Aso-Ebi</span>
              planning
            </h1>
            <p class="body-large text-text-secondary mb-8 max-w-lg">
              From sourcing fabrics to easy guest payments and stress-free delivery — we take the stress off you, so you focus on what matters.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <a routerLink="/signup"
                 class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 body-base font-semibold text-text-inverse no-underline transition-all hover:bg-primary-light active:bg-primary-dark shadow-lg shadow-primary/25">
                Create Your Aso-Ebi Page
                <svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a href="https://eventparcel-sourcing.lovable.app" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 body-base font-semibold text-text-primary no-underline transition-all hover:bg-surface-alt">
                Source Fabrics
              </a>
            </div>
            <div class="mt-8 flex items-center gap-6">
              <div class="flex -space-x-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-body-xs font-bold text-primary">A</div>
                <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary/10 text-body-xs font-bold text-secondary">B</div>
                <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-accent/10 text-body-xs font-bold text-accent-light">C</div>
              </div>
              <div>
                <div class="flex items-center gap-1">
                  <span class="text-lg font-bold text-text-primary">4.7</span>
                  <span class="text-secondary">★★★★★</span>
                </div>
                <p class="body-xs text-text-muted">Average host rating</p>
              </div>
            </div>
          </div>

          <!-- Hero Visual -->
          <div class="relative lg:block">
            <div class="relative z-10 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-2 shadow-2xl">
              <div class="rounded-xl bg-card p-6 shadow-inner">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="h-3 w-3 rounded-full bg-error"></div>
                      <div class="h-3 w-3 rounded-full bg-warning"></div>
                      <div class="h-3 w-3 rounded-full bg-success"></div>
                    </div>
                    <span class="body-xs font-medium text-text-muted">Event Dashboard</span>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 rounded-lg bg-surface-alt p-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <span class="text-sm font-bold text-primary">AE</span>
                      </div>
                      <div class="flex-1">
                        <p class="body-small font-medium text-text-primary">Ade's Wedding</p>
                        <p class="body-xs text-text-muted">24 guests · 12 paid</p>
                      </div>
                      <span class="rounded-full bg-success/10 px-2.5 py-0.5 body-xs font-medium text-success">Active</span>
                    </div>
                    <div class="flex items-center gap-3 rounded-lg bg-surface-alt p-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                        <span class="text-sm font-bold text-secondary">OF</span>
                      </div>
                      <div class="flex-1">
                        <p class="body-small font-medium text-text-primary">Ola's Birthday</p>
                        <p class="body-xs text-text-muted">18 guests · 18 paid</p>
                      </div>
                      <span class="rounded-full bg-info/10 px-2.5 py-0.5 body-xs font-medium text-info">Completed</span>
                    </div>
                    <div class="flex items-center gap-3 rounded-lg bg-surface-alt p-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <span class="text-sm font-bold text-accent-light">CF</span>
                      </div>
                      <div class="flex-1">
                        <p class="body-small font-medium text-text-primary">Chi's Owambe</p>
                        <p class="body-xs text-text-muted">48 guests · 36 paid</p>
                      </div>
                      <span class="rounded-full bg-warning/10 px-2.5 py-0.5 body-xs font-medium text-warning">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Decorative elements -->
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary/20 blur-2xl"></div>
            <div class="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── How It Works ─── -->
    <section class="py-20 sm:py-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <div class="mb-2 inline-flex items-center gap-2">
            <span class="text-lg">✨</span>
            <span class="body-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
          </div>
          <h2 class="heading-2 text-text-primary mb-4">
            Four simple steps to <span class="text-primary">perfect Aso-Ebi</span>
          </h2>
          <p class="body-large text-text-secondary">
            From fabric to guest's doorstep — we've simplified every step of the journey.
          </p>
        </div>

        <div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Step 1 -->
          <div class="group relative rounded-2xl bg-card border border-border p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-inverse transition-all">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
              </svg>
            </div>
            <span class="body-xs font-bold uppercase tracking-wider text-primary/60 mb-1 block">Step 1</span>
            <h3 class="heading-5 text-text-primary mb-2">Source your Fabrics</h3>
            <p class="body-small text-text-secondary">Choose from our curated vendors or let us source the perfect Aso-Ebi for you.</p>
          </div>

          <!-- Step 2 -->
          <div class="group relative rounded-2xl bg-card border border-border p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-text-inverse transition-all">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.37a4.5 4.5 0 00-3.13-1.632l-4.5-4.5A4.5 4.5 0 003.543 6.732l1.757 1.757m11.39 11.39a4.5 4.5 0 01-3.13 1.632l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757"/>
              </svg>
            </div>
            <span class="body-xs font-bold uppercase tracking-wider text-secondary/60 mb-1 block">Step 2</span>
            <h3 class="heading-5 text-text-primary mb-2">Create & Share Page</h3>
            <p class="body-small text-text-secondary">Set up your Aso-Ebi page and share a payment link with all your guests instantly.</p>
          </div>

          <!-- Step 3 -->
          <div class="group relative rounded-2xl bg-card border border-border p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-text-inverse transition-all">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m0 0v-.375c0-.621-.504-1.125-1.125-1.125H3.75M20.25 6v9M6.75 6a.75.75 0 00-.75.75v.75a.75.75 0 001.5 0V6.75a.75.75 0 00-.75-.75z"/>
              </svg>
            </div>
            <span class="body-xs font-bold uppercase tracking-wider text-success/60 mb-1 block">Step 3</span>
            <h3 class="heading-5 text-text-primary mb-2">Guests Order & Pay</h3>
            <p class="body-small text-text-secondary">Guests place their orders and pay securely through our Paystack-powered platform.</p>
          </div>

          <!-- Step 4 -->
          <div class="group relative rounded-2xl bg-card border border-border p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-info/10 text-info group-hover:bg-info group-hover:text-text-inverse transition-all">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
              </svg>
            </div>
            <span class="body-xs font-bold uppercase tracking-wider text-info/60 mb-1 block">Step 4</span>
            <h3 class="heading-5 text-text-primary mb-2">We Deliver</h3>
            <p class="body-small text-text-secondary">We pick up from you or your vendor, package, and deliver directly to every guest.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Why Event Parcel ─── -->
    <section class="py-20 sm:py-28 bg-gradient-to-b from-surface-alt to-surface">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div class="mb-2 inline-flex items-center gap-2">
              <span class="text-lg">💪</span>
              <span class="body-xs font-semibold uppercase tracking-widest text-primary">Why Event Parcel</span>
            </div>
            <h2 class="heading-2 text-text-primary mb-4">
              Why hosts choose <span class="text-primary">Event Parcel</span>
            </h2>
            <ul class="space-y-4">
              @for (benefit of benefits; track benefit) {
                <li class="flex items-start gap-3">
                  <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  </div>
                  <span class="body-base text-text-secondary">{{ benefit }}</span>
                </li>
              }
            </ul>
            <a routerLink="/signup"
               class="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 body-base font-semibold text-text-inverse no-underline transition-all hover:bg-primary-light active:bg-primary-dark">
              Get Started Free
              <svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
          <div class="relative">
            <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
              <div class="h-full w-full rounded-xl bg-card p-6 shadow-inner flex items-center justify-center">
                <div class="text-center">
                  <div class="text-5xl mb-4">🎉</div>
                  <p class="heading-4 text-text-primary">"No more chasing guests for payments"</p>
                  <p class="body-base text-text-secondary mt-2">Everything in one place, automatically tracked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── For Everyone ─── -->
    <section class="py-20 sm:py-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center mb-16">
          <div class="mb-2 inline-flex items-center gap-2">
            <span class="text-lg">🌟</span>
            <span class="body-xs font-semibold uppercase tracking-widest text-primary">Our Features</span>
          </div>
          <h2 class="heading-2 text-text-primary mb-4">
            Built for <span class="text-primary">everyone</span> in the celebration
          </h2>
        </div>
        <div class="grid gap-8 sm:grid-cols-3">
          @for (role of roles; track role.title) {
            <div class="group rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl text-3xl" [class]="role.bgClass">
                {{ role.emoji }}
              </div>
              <h3 class="heading-4 text-text-primary mb-3">{{ role.title }}</h3>
              <p class="body-base text-text-secondary mb-6">{{ role.description }}</p>
              <ul class="space-y-2">
                @for (feature of role.features; track feature) {
                  <li class="flex items-center gap-2 body-small text-text-secondary">
                    <svg class="h-4 w-4 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── CTA ─── -->
    <section class="py-20 sm:py-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-accent px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <div class="absolute inset-0 opacity-[0.08]"
               style="background-image: radial-gradient(circle at 25% 50%, white 1px, transparent 1px); background-size: 40px 40px;">
          </div>
          <div class="relative z-10 text-center max-w-2xl mx-auto">
            <h2 class="heading-2 text-white mb-4">
              Celebrate fully. We'll handle the rest.
            </h2>
            <p class="body-large text-white/80 mb-8">
              Join thousands of hosts who've simplified their Aso-Ebi management. Free to start.
            </p>
            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a routerLink="/signup"
                 class="inline-flex items-center rounded-lg bg-white px-8 py-3.5 body-base font-semibold text-primary no-underline transition-all hover:bg-white/90 active:bg-white/80 shadow-xl shadow-black/10">
                Create Your Free Page
                <svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a href="https://wa.me/2349161939774" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center rounded-lg border border-white/30 px-8 py-3.5 body-base font-semibold text-white no-underline transition-all hover:bg-white/10">
                Request Custom Boxes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class LandingPage {
  protected readonly benefits = [
    'No chasing guests for payment',
    'Orders and payments tracked automatically',
    'Pickup and delivery handled for you',
    'Collaborate with partner or planner',
    'Everything in one place',
  ];

  protected readonly roles = [
    {
      emoji: '👰',
      title: 'Built for Hosts',
      bgClass: 'bg-primary/10',
      description: 'Manage Aso-Ebi orders, payments, and delivery without stress or last-minute pressure.',
      features: ['Create event pages', 'Track guest orders', 'Automatic payment collection', 'Delivery coordination'],
    },
    {
      emoji: '📋',
      title: 'Built for Planners',
      bgClass: 'bg-secondary/10',
      description: 'Run Aso-Ebi orders, payments and logistics for your clients on a single dashboard.',
      features: ['Multi-client management', 'Real-time progress tracking', 'Co-host collaboration', 'Client reporting'],
    },
    {
      emoji: '🧵',
      title: 'Built for Vendors',
      bgClass: 'bg-accent/10',
      description: 'Collect payment and capture addresses within the app. Deliver fabric directly to guests.',
      features: ['Direct customer payments', 'Address capture', 'Bulk delivery management', 'Inventory tracking'],
    },
  ];
}
