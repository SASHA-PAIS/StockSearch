import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { ComponentRef } from '@angular/core';

interface CustomDetachedRouteHandle extends DetachedRouteHandle {
  componentRef: ComponentRef<any>;
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && route.routeConfig.path === 'search/:symbol';
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (route.routeConfig && route.routeConfig.path === 'search/:symbol' && handle !== null) {
      this.storedRoutes.set(route.routeConfig.path, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.storedRoutes.get(route.routeConfig.path as string);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return route.routeConfig ? this.storedRoutes.get(route.routeConfig.path as string)  ?? null : null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Call onAttach when reattaching a route
    if (future.routeConfig === curr.routeConfig && future.component) {
      const path = future.routeConfig?.path ?? ''; // Provide an empty string as fallback
      const handle = this.storedRoutes.get(path) as CustomDetachedRouteHandle; // Cast to custom type
      if (handle && handle.componentRef && handle.componentRef.instance && handle.componentRef.instance.onAttach) {
        handle.componentRef.instance.onAttach();
      }
    }
    return future.routeConfig === curr.routeConfig;
  }

  detach(route: ActivatedRouteSnapshot): void {
    // Call onDetach when detaching a route
    const path = route.routeConfig?.path ?? ''; // Provide an empty string as fallback
    const handle = this.storedRoutes.get(path) as CustomDetachedRouteHandle | undefined; // Cast to custom type
    if (handle && handle.componentRef && handle.componentRef.instance && handle.componentRef.instance.onDetach) {
      handle.componentRef.instance.onDetach();
    }
  }
  
}