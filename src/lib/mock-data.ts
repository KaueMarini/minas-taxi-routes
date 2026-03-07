export interface Passenger {
  id: string;
  name: string;
  address: string;
  phone: string;
  costCenter: string;
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

export const MOCK_PASSENGERS: Passenger[] = [
  { id: "1", name: "Carlos Eduardo Silva", address: "Rua Paraíba, 420 - Funcionários, BH", phone: "(31) 99812-3456", costCenter: "ENG-001" },
  { id: "2", name: "Ana Beatriz Souza", address: "Av. Afonso Pena, 1500 - Centro, BH", phone: "(31) 98765-4321", costCenter: "ADM-002" },
  { id: "3", name: "Roberto Mendes", address: "Rua Sergipe, 850 - Savassi, BH", phone: "(31) 99654-7890", costCenter: "TI-003" },
  { id: "4", name: "Juliana Ferreira", address: "Rua Espírito Santo, 1200 - Lourdes, BH", phone: "(31) 97432-1098", costCenter: "RH-004" },
  { id: "5", name: "Pedro Henrique Costa", address: "Av. Brasil, 2300 - Santa Efigênia, BH", phone: "(31) 98321-6543", costCenter: "FIN-005" },
  { id: "6", name: "Mariana Oliveira", address: "Rua Curitiba, 670 - Centro, BH", phone: "(31) 99178-2345", costCenter: "ENG-001" },
];

export function generateRoutes(passengers: Passenger[], arrivalTime: string, destination: string): RouteCard[] {
  const routes: RouteCard[] = [];
  const chunkSize = 3;

  const [hours, minutes] = arrivalTime.split(":").map(Number);

  // Generate route names based on addresses
  const routeNames = ["Rota A", "Rota B", "Rota C", "Rota D", "Rota E", "Rota F"];

  for (let i = 0; i < passengers.length; i += chunkSize) {
    const group = passengers.slice(i, i + chunkSize);
    const vehicleNumber = Math.floor(i / chunkSize) + 1;

    const totalPickupMinutes = group.length * 12;
    const travelMinutes = 20;
    const totalMinutes = totalPickupMinutes + travelMinutes;

    const departureTotal = hours * 60 + minutes - totalMinutes;
    const depH = Math.floor(departureTotal / 60);
    const depM = departureTotal % 60;

    const pickupTimes = group.map((_, idx) => {
      const pickupTotal = departureTotal + idx * 12;
      const pH = Math.floor(pickupTotal / 60);
      const pM = pickupTotal % 60;
      return `${String(pH).padStart(2, "0")}:${String(pM).padStart(2, "0")}`;
    });

    // Extract city from first passenger's address for route name
    const firstAddress = group[0]?.address || "";
    const cityMatch = firstAddress.match(/,\s*([^,]+)$/);
    const routeName = cityMatch ? `Rota ${cityMatch[1].trim()}` : routeNames[vehicleNumber - 1] || `Rota ${vehicleNumber}`;

    const travelHours = Math.floor(totalMinutes / 60);
    const travelMins = totalMinutes % 60;
    const estimatedTravelTime = travelHours > 0 
      ? `${travelHours}h${travelMins > 0 ? String(travelMins).padStart(2, "0") : ""}` 
      : `${travelMins} min`;

    routes.push({
      id: `route-${vehicleNumber}`,
      vehicleNumber,
      routeName,
      passengers: group,
      departureTime: `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`,
      pickupTimes,
      arrivalTime,
      estimatedTravelTime,
    });
  }

  return routes;
}
