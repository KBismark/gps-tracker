import {
    ApplicationRef,
    ComponentRef,
    EnvironmentInjector,
    EmbeddedViewRef,
    Type,
    createComponent,
  } from '@angular/core';
  
  export function createDetachedComponent<T>(
    component: Type<T>,
    injector: EnvironmentInjector,
    /** Attach for change detection */
    appRef?: ApplicationRef 
  ): { dom: HTMLElement; ref: ComponentRef<T>, cleanup:()=>void } {
    const ref = createComponent(component, { environmentInjector: injector });
  
    if (appRef) {
      appRef.attachView(ref.hostView); 
    }
  
    const dom = (ref.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    
    return { 
        dom, ref, 
        cleanup(){
            if(appRef){
                appRef.detachView(ref.hostView);
            }
            ref.destroy();
        } 
    };
  }
  