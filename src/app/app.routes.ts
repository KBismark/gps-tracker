import { Routes } from '@angular/router';
import { MapView } from './pages/viewer/map-view';
import { TrackView } from './pages/tracker/tracker';

export const routes: Routes = [
    {
        path: '',
        component: MapView
    },
    {
        path: 'track',
        component: TrackView
    }
];
