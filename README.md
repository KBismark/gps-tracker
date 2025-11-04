# GpsTracker

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.    

## Notes on starting app
> The socket transmission of data will not work in dev mode because of Angular's universal request handler.     
> You must build the application and run the built app for it to work. Run `pnpm run build` to build and `pnpm run server` to start the server.    
> Then open your browser and navigate to `http://localhost:4000/` to view the Map and open `http://localhost:4000/track` as the driver.        
>

## Some tools used in this app 
- Maptiler SDK (Requires API key) - (https://cloud.maptiler.com/maps/)[Get one for free on Maptiler]    
- Angular with Server Side Rendering
- Socket.io for real-time location updates    



## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.


## Additional Notes
> The socket transmission of data will not work in dev mode because of Angular's universal request handler. 
> You must build the application and run the built app for it to work. Run `pnpm run build` to build and `pnpm run server` to start the app.
> 


