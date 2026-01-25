import { envs } from '../config/env.config.js';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      type: string;
      coordinates: number[][];
    };
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction?: string;
        };
        distance: number;
        duration: number;
      }>;
    }>;
  }>;
}

export class OSRMService {
  private baseUrl: string;

  constructor() {
    // Usa servidor local si está en .env, sino usa OSRM público
    this.baseUrl = envs.OSRM_URL || 'https://router.project-osrm.org';
  }

  /**
   * Calcula una ruta entre dos puntos
   */
  async calculateRoute(start: RoutePoint, end: RoutePoint) {
    const url = `${this.baseUrl}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}`;
    
    try {
      const response = await fetch(`${url}?overview=full&geometries=geojson&steps=true`);
      
      if (!response.ok) {
        throw new Error(`OSRM Error: ${response.status} ${response.statusText}`);
      }

      const data: OSRMRouteResponse = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found between the given points');
      }

      const route = data.routes[0];

      return {
        geometry: route.geometry,
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
        steps: route.legs[0]?.steps.map((step) => ({
          instruction: step.maneuver.instruction || '',
          distance: step.distance,
          duration: step.duration,
        })) || [],
      };
    } catch (error) {
      console.error('OSRM Service Error:', error);
      throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calcula una ruta con múltiples paradas (waypoints)
   */
  async calculateMultiStopRoute(waypoints: RoutePoint[]) {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required');
    }

    const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(';');
    const url = `${this.baseUrl}/route/v1/driving/${coords}`;

    try {
      const response = await fetch(`${url}?overview=full&geometries=geojson`);
      
      if (!response.ok) {
        throw new Error(`OSRM Error: ${response.status}`);
      }

      const data: OSRMRouteResponse = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found for the given waypoints');
      }

      const route = data.routes[0];

      return {
        geometry: route.geometry,
        distance: route.distance / 1000,
        duration: route.duration / 60,
      };
    } catch (error) {
      console.error('OSRM Multi-stop Route Error:', error);
      throw new Error(`Failed to calculate multi-stop route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
