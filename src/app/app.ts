
import { RouterOutlet } from '@angular/router';


import { AfterViewInit, ApplicationRef, Component, effect, ElementRef, EnvironmentInjector, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { Map, config, Marker, GeolocateControl, GeolocationType } from '@maptiler/sdk';
import { environment } from "@/environments/env";
import { NgClass } from '@angular/common';
// import { SearchService } from "@services/search.service";
import { timer } from 'rxjs';
import { createDetachedComponent } from "@/app/lib/detached.component";
import { CarMarker } from './components/car-marker/car-marker';
// import { ItemMarkerComponent } from "@components/item-marker/item-marker.component";

@Component({
  selector: 'app-root',
  imports: [ NgClass, RouterOutlet],
   templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
