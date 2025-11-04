
import { AfterViewInit, ApplicationRef, Component, ComponentRef, effect, ElementRef, EnvironmentInjector, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { Map, config, Marker, GeolocateControl, GeolocationType } from '@maptiler/sdk';
import { io, Socket } from 'socket.io-client';
import { environment } from "@/environments/env";
import { NgClass } from '@angular/common';
import { timer } from 'rxjs';
import { createDetachedComponent } from "@/app/lib/detached.component";
import { CarMarker } from '@/app/components/car-marker/car-marker';

@Component({
    selector: 'app-root',
    imports: [NgClass],
    templateUrl: './map-view.html'
})
export class MapView implements OnInit, AfterViewInit, OnDestroy {
    private map: Map | undefined;
    private marker: Marker | undefined;
    private markerRef: ComponentRef<CarMarker> | undefined;
    private markerAvailabe = signal(false);
    private readonly mapContainer = viewChild<ElementRef<HTMLElement>>('map');
    protected readonly mapLoaded = signal(false);
    private readonly detachedComponentEnvironment = inject(EnvironmentInjector);
    private readonly appRef = inject(ApplicationRef);
    public username = `CarViewer`;
    private socket!: Socket;

    private defaultLngLat = [-0.1401472, 5.6352736]
    private lastPosition: [number, number] | null = null;

    constructor() {
        effect((cleanup) => {
            if (this.markerAvailabe()) {
                const timeout = timer(300).subscribe(() => {
                    this.map?.rotateTo(360, { duration: 1000, zoom: 14, animate: true, pitch: 55, roll: 0 });
                });
                cleanup(() => {
                    timeout.unsubscribe()
                })
            }

        })
    }

    ngOnInit(): void {
        config.apiKey = environment.MAP_API_KEY;

        this.socket = io({ transports: ['websocket'] });
        this.socket.emit('set-username', this.username);

        this.socket.on('user-location-update', ({ longitude, latitude }) => {
            const currentPosition: [number, number] = [longitude, latitude];

            // Create the marker if the first location details is in
            if (!this.marker) {
                const { dom, ref } = createDetachedComponent(CarMarker, this.detachedComponentEnvironment, this.appRef);
                this.marker = new Marker({ element: dom, }).setLngLat([longitude, latitude]).addTo(this.map!);
                this.markerRef = ref;
                this.map?.setCenter({ lng: longitude, lat: latitude });
                this.markerAvailabe.set(true);
                this.lastPosition = currentPosition;
                return;
            }

            // Compute bearing if we have a previous position
            if (this.lastPosition) {
                const bearing = this.computeBearing(this.lastPosition, currentPosition);
                const carRotationY = bearing > 200 && bearing < 250 ? 180 : 0;

                // Turn the marker based on the bearing
                const el = this.marker.getElement();
                (el.firstElementChild! as HTMLElement).style.transform = `rotateY(${carRotationY}deg)`;
            }

            // Update marker position
            this.marker.setLngLat(currentPosition);
            this.lastPosition = currentPosition;
        })
    }

    ngOnDestroy() {
        this.map?.remove();
    }

    ngAfterViewInit(): void {
        // Setup map configuartions
        this.map = new Map({
            container: this.mapContainer()!.nativeElement,
            style: environment.CUSTOM_MAP_STYLES,
            zoom: 14,
            navigationControl: 'bottom-right',
            geolocateControl: false,
            logoPosition: 'bottom-left',
            geolocate: GeolocationType.POINT,
            maxZoom: 16,
            minZoom: 11
        });

        this.map.addControl(
            new GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: false,
                showAccuracyCircle: false,
                showUserLocation: true,
            }),
            'bottom-right',
        );

        this.map.on('load', () => {
            this.mapLoaded.set(true);
        })
    }

    private computeBearing(prev: [number, number], next: [number, number]): number {
        const [lon1, lat1] = prev.map(this.toRadians);
        const [lon2, lat2] = next.map(this.toRadians);

        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

        const bearing = (Math.atan2(y, x) * 180) / Math.PI;
        return (bearing + 360) % 360; // normalize 0–360
    }

    private toRadians(deg: number): number {
        return (deg * Math.PI) / 180;
    }

}
