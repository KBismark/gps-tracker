import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { LinearMovementOptions, Location } from './interface';

@Component({
    selector: 'app-tracker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tracker.html',
})
export class TrackView implements OnInit, OnDestroy {
    public username = `CarTracker`;
    public intervalMs = 3000;
    private socket!: Socket;
    private intervalId!: ReturnType<typeof setTimeout>;
    protected readonly startLat = signal<number | null>(null);
    protected readonly startLng = signal<number | null>(null);
    private readonly pathIndex = signal(0);
    private readonly path = signal<{ lat: number; lng: number }[]>([]);

    // History of sent locations to be logged on screen
    protected readonly locations = signal<Location[]>([]);

    // Fallback location 
    private readonly defaultLngLat = [-0.1401472, 5.6352736];

    protected readonly simulatedLocation = computed(() => {
        const lat = this.startLat();
        const lng = this.startLng();
        const path = this.path();
        const index = this.pathIndex();
        

        if (lat === null || lng === null || !path.length) return null;

        const offset = path[index];
        return {
            latitude: lat + offset.lat,
            longitude: lng + offset.lng,
            timestamp: Date.now(),
        };
    });

    ngOnInit() {
        this.socket = io({ transports: ['websocket'] });
        this.socket.emit('set-username', this.username);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
        this.socket.disconnect();
    }

    protected startTracking() {
        if (!navigator.geolocation) {
            alert('Geolocation not supported — using fallback location');
            this.useDefaultLocation();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.updateTrackerLocation([position.coords.longitude, position.coords.latitude])
                this.createPathAroundUser(); 
                this.beginSimulation();
            },
            () => {
                alert('Could not get user location, using default location');
                this.useDefaultLocation();
            },
            { enableHighAccuracy: true }
        );
    }

    private useDefaultLocation() {
        this.updateTrackerLocation([this.defaultLngLat[0], this.defaultLngLat[1]]);
        this.createPathAroundUser();
        this.beginSimulation();
    }

    private createPathAroundUser() {
        const baseLat = this.startLat();
        const baseLng = this.startLng();
        if (baseLat === null || baseLng === null) return;

        const stepCount = 15; // For every linear movement, move `stepCount` steps
        
        const stepSize = 0.0002; // Steps distance

        // Simulate a 30 step linear movement in the south-east direction 
        const southEast_1 = this.getLinearMovement({
            direction: 'southeast',
            stepCount,
            stepSize,
            startIndex: 0
        })

        // Simulate a turn to the south-west direction and move 30 step
        const southWest_1 = this.getLinearMovement({
            direction: 'southwest',
            stepCount,
            stepSize,
            startIndex: stepCount
        })

        // Simulate a turn to the south-west direction and move 30 step
        const southEast_2 = this.getLinearMovement({
            direction: 'southeast',
            stepCount,
            stepSize,
            startIndex: stepCount * 2
        })

        // Simulate a turn to the south-west direction and move 30 step
        const southWest_2 = this.getLinearMovement({
            direction: 'southwest',
            stepCount,
            stepSize,
            startIndex: stepCount * 3
        });

        // Simulate a turn to the south-west direction and move 30 step
        const southEast_3 = this.getLinearMovement({
            direction: 'southeast',
            stepCount,
            stepSize,
            startIndex: stepCount * 4
        })
            

        this.path.set([...southEast_1, ...southWest_1, ...southEast_2, ...southWest_2, ...southEast_3]);
    }

    private getLinearMovement({ direction, stepCount, stepSize, startIndex }: LinearMovementOptions) {
        let deltaLat = 0;
        let deltaLng = 0;

        switch (direction) {
            case 'forward':   // East 
                deltaLng = stepSize;
                break;
            case 'backward':  // West 
                deltaLng = -stepSize;
                break;
            case 'upward':    // North 
                deltaLat = stepSize;
                break;
            case 'downward':  // South 
                deltaLat = -stepSize;
                break;
            case 'northeast': 
                deltaLat = stepSize;
                deltaLng = stepSize;
                break;
            case 'northwest': 
                deltaLat = stepSize;
                deltaLng = -stepSize;
                break;
            case 'southeast': 
                deltaLat = -stepSize;
                deltaLng = stepSize;
                break;
            case 'southwest': 
                deltaLat = -stepSize;
                deltaLng = -stepSize;
                break;
        }

        // Simulate a 30 step linear movement in the provided direction 
        return Array.from({ length: stepCount }, (_, i) => {
            // index = i + startIndex; Useful for movement 
            // with respect to the starting position of tracker (driver)
            
            const index = 1;
            return {
                lat: index * deltaLat,
                lng: index * deltaLng,
            }
            
        });
    }

    private beginSimulation() {
        clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            const loc = this.simulatedLocation();
            if (!loc) return;

            // Send location update to server
            this.socket.emit('location-update', loc);

            this.updateTrackerLocation([loc.longitude, loc.latitude])

            // set the next movement index. Loops back to start if all movements are used up
            this.pathIndex.set((this.pathIndex() + 1) % this.path().length);
            
            this.locations.update((prev) => [...prev, loc]);
        }, this.intervalMs);
    }

    private updateTrackerLocation(lnglat: [number, number]){
        this.startLng.set(lnglat[0]);
        this.startLat.set(lnglat[1]);
    }
}

