import { Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-picker.html',
  styleUrl: './map-picker.scss',
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat = 6.5244;  // Lagos, Nigeria
  @Input() initialLng = 3.3792;
  @Input() initialVenue = '';
  @Input() initialCity = '';
  @Output() locationSelected = new EventEmitter<{ venue: string; city: string; lat: number; lng: number }>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker!: L.Marker;
  searchQuery = '';
  searchResults: NominatimResult[] = [];
  isSearching = false;
  selectedAddress = '';
  selectedCity = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.initialLat, this.initialLng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Fix default marker icon
    const icon = L.divIcon({
      html: `<div style="background:#8B1A1A;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    });

    this.marker = L.marker([this.initialLat, this.initialLng], { icon, draggable: true }).addTo(this.map);

    // On marker drag
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.reverseGeocode(pos.lat, pos.lng);
    });

    // On map click
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // If we have initial venue, set it
    if (this.initialVenue) {
      this.selectedAddress = this.initialVenue;
      this.selectedCity = this.initialCity;
    }
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.isSearching = true;
      const query = encodeURIComponent(this.searchQuery.trim());
      fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=ng`)
        .then(res => res.json())
        .then((results: NominatimResult[]) => {
          this.searchResults = results;
          this.isSearching = false;
        })
        .catch(() => {
          this.searchResults = [];
          this.isSearching = false;
        });
    }, 300);
  }

  selectSearchResult(result: NominatimResult): void {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], 15);
    this.selectedAddress = result.display_name;
    this.selectedCity = result.address.city || result.address.town || result.address.village || '';
    this.searchResults = [];
    this.searchQuery = result.display_name;
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then((result: NominatimResult) => {
        this.selectedAddress = result.display_name;
        this.selectedCity = result.address.city || result.address.town || result.address.village || '';
        this.searchQuery = result.display_name;
      })
      .catch(() => {
        this.selectedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        this.selectedCity = '';
      });
  }

  confirm(): void {
    const pos = this.marker.getLatLng();
    this.locationSelected.emit({
      venue: this.selectedAddress,
      city: this.selectedCity,
      lat: pos.lat,
      lng: pos.lng,
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('map-overlay')) {
      this.cancel();
    }
  }
}
