export type MovementDirection =
    | 'forward'     // east 
    | 'backward'    // west 
    | 'upward'      // north 
    | 'downward'    // south 
    | 'northeast'  
    | 'northwest'   
    | 'southeast'   
    | 'southwest';  

export interface LinearMovementOptions {
    direction: MovementDirection,
    stepCount: number,
    stepSize: number,
    startIndex: number
}

export interface Location {
    latitude: number;
    longitude: number;
    timestamp: number;
}