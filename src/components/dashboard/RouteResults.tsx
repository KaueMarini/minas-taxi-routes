import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteCard } from "@/lib/mock-data";
import { Car, Copy, MapPin, Clock, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";

interface RouteResultsProps {
  routes: RouteCard[];
  isOptimizing: boolean;
  companyName: string;
  destination: string;
}

const RouteResults = ({ routes, isOptimizing, companyName, destination }: RouteResultsProps) => {
  const copyRoute = (route: RouteCard) => {
    const lines = [
      `🚕 *Minas Taxi — Rota Veículo ${route.vehicleNumber}*`,
      `📍 Destino: ${companyName || "Empresa"} — ${destination || "Endereço"}`,
      `⏰ Chegada prevista: ${route.arrivalTime}`,
      "",
      ...route.passengers.map(
        (p, i) =>
          `${i + 1}. ${p.name}\n   📌 ${p.address}\n   🕐 Embarque: ${route.pickupTimes[i]}\n   📱 ${p.phone}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Resumo copiado para a área de transferência!");
  };

  if (isOptimizing) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-display text-lg font-semibold text-foreground">Analisando endereços e calculando rotas...</p>
        <p className="mt-1 text-sm text-muted-foreground">Nosso algoritmo está otimizando os trajetos</p>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-20 text-center">
        <Navigation className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold text-muted-foreground">Resultados da Otimização</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground/70">
          Importe passageiros e clique em "Otimizar Rotas com IA" para ver as rotas sugeridas aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-foreground">
        Rotas Otimizadas ({routes.length} veículo{routes.length > 1 ? "s" : ""})
      </h2>
      {routes.map((route) => (
        <Card key={route.id} className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Veículo {route.vehicleNumber}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {route.passengers.length} passageiro{route.passengers.length > 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Timeline */}
            <div className="relative ml-3 border-l-2 border-primary/30 pb-2 pl-6">
              {route.passengers.map((p, idx) => (
                <div key={p.id} className="relative mb-5 last:mb-3">
                  <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.address}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {route.pickupTimes[idx]}
                    </div>
                  </div>
                </div>
              ))}
              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-taxi-dark">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{companyName || "Destino"}</p>
                    <p className="text-xs text-muted-foreground">{destination || "Endereço de destino"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                    <Clock className="h-3 w-3" />
                    {route.arrivalTime}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2"
              onClick={() => copyRoute(route)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar Resumo da Rota
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RouteResults;
