export interface Passenger {
  id: string;
  name: string;
  address: string;
  phone: string;
  costCenter: string;
  re: string;
}

export interface RouteCard {
  id: string;
  vehicleNumber: number;
  routeName: string;
  passengers: Passenger[];
  departureTime: string;
  pickupTimes: string[];
  arrivalTime: string;
  estimatedTravelTime: string;
}

