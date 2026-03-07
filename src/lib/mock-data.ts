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

// Lista vazia por padrão, pois os dados virão do Excel ou formulário
export const MOCK_PASSENGERS: Passenger[] = [];

/**
 * FUNÇÃO DE INTELIGÊNCIA DE ROTAS
 * Agrupa passageiros por proximidade (baseado no texto do bairro/cidade),
 * limita a 3 por carro e calcula os horários lógicos.
 */
export function generateRoutes(passengers: Passenger[], arrivalTime: string, destination: string): RouteCard[] {
  const routes: RouteCard[] = [];
  const MAX_PASSENGERS_PER_CAR = 3;

  // 1. ALGORITMO DE AGRUPAMENTO (Clusterização por texto)
  // Ordena os passageiros extraindo a última parte do endereço (geralmente Bairro ou Cidade/Estado)
  // Assim, pessoas da mesma região ficam juntas no array antes de dividir nos carros.
  const sortedPassengers = [...passengers].sort((a, b) => {
    const getRegion = (addr: string) => {
      const parts = addr.split('-');
      return parts.length > 1 ? parts[parts.length - 1].trim().toLowerCase() : addr.toLowerCase();
    };
    return getRegion(a.address).localeCompare(getRegion(b.address));
  });

  // Converte o horário de chegada exigido (Ex: "08:00") para minutos totais
  const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number);
  const arrivalTotalMinutes = arrivalHours * 60 + arrivalMinutes;

  // 2. DIVISÃO EM CARROS E CÁLCULO DE TEMPO
  for (let i = 0; i < sortedPassengers.length; i += MAX_PASSENGERS_PER_CAR) {
    const group = sortedPassengers.slice(i, i + MAX_PASSENGERS_PER_CAR);
    const vehicleNumber = Math.floor(i / MAX_PASSENGERS_PER_CAR) + 1;

    // Regras de tempo simuladas (pode ajustar conforme a realidade):
    // - 20 minutos de viagem base até a empresa
    // - Mais 12 minutos adicionais para CADA passageiro no carro (tempo de desvio/embarque)
    const travelMinutes = 20;
    const totalPickupMinutes = group.length * 12; 
    const totalRouteDuration = totalPickupMinutes + travelMinutes;

    // Calcula que horas o motorista tem que sair para buscar o PRIMEIRO passageiro
    const departureTotalMinutes = arrivalTotalMinutes - totalRouteDuration;
    
    // Formata a hora de saída do 1º passageiro
    const depH = Math.floor(departureTotalMinutes / 60);
    const depM = departureTotalMinutes % 60;
    const formattedDepartureTime = `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`;

    // Calcula os horários de embarque de cada passageiro subsequente
    const pickupTimes = group.map((_, idx) => {
      // O primeiro embarca na hora de saída, os próximos a cada 12 minutos
      const pickupTotal = departureTotalMinutes + (idx * 12);
      const pH = Math.floor(pickupTotal / 60);
      const pM = pickupTotal % 60;
      return `${String(pH).padStart(2, "0")}:${String(pM).padStart(2, "0")}`;
    });

    // Gera um nome para a rota baseado na região do primeiro passageiro do carro
    const firstAddress = group[0]?.address || "";
    const cityMatch = firstAddress.split('-');
    const regionName = cityMatch.length > 1 ? cityMatch[cityMatch.length - 1].trim() : "Rota " + vehicleNumber;
    const routeName = `Região ${regionName}`;

    // Formata o tempo estimado de viagem (Ex: 1h15 ou 45 min)
    const travelHours = Math.floor(totalRouteDuration / 60);
    const travelMins = totalRouteDuration % 60;
    const estimatedTravelTime = travelHours > 0 
      ? `${travelHours}h${travelMins > 0 ? String(travelMins).padStart(2, "0") : ""}` 
      : `${travelMins} min`;

    // Salva o "Carro" na lista final
    routes.push({
      id: `route-${vehicleNumber}`,
      vehicleNumber,
      routeName,
      passengers: group,
      departureTime: formattedDepartureTime,
      pickupTimes,
      arrivalTime,
      estimatedTravelTime,
    });
  }

  return routes;
}