import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteCard } from "@/lib/mock-data";
import { Car, Copy, MapPin, Clock, Loader2, Navigation, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface RouteResultsProps {
  routes: RouteCard[];
  isOptimizing: boolean;
  companyName: string;
  destination: string;
  scheduledDate?: string;
  arrivalTime: string;
  payment?: string;
  solicitante?: string;
  phone?: string;
}

const paymentLabels: Record<string, string> = {
  faturado: "Faturado",
  cartao: "Cartão Corporativo",
  pix: "PIX",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

const RouteResults = ({
  routes,
  isOptimizing,
  companyName,
  destination,
  scheduledDate,
  arrivalTime,
  payment,
  solicitante,
  phone,
}: RouteResultsProps) => {
  const copyRoute = (route: RouteCard) => {
    const costCenters = route.passengers
      .map((p) => p.costCenter)
      .filter(Boolean)
      .join(" / ");

    const lines = [
      `🚕 *CARRO ${route.vehicleNumber} - ${route.routeName}*`,
      "",
      `Empresa: ${companyName || "[A preencher]"}`,
      `Fone: ${phone || "[A preencher]"}`,
      `Solicitante: ${solicitante || "[A preencher]"}`,
      "",
      `*Passageiros e Origens (Ordem de embarque):*`,
      "",
      ...route.passengers.map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${p.address}${p.phone ? `\n   📱 ${p.phone}` : ""}`
      ),
      "",
      `*Destino:* ${destination || "[A preencher]"}`,
      costCenters ? `*Centro de Custo:* ${costCenters}` : "",
      scheduledDate ? `*Agendamento:* ${scheduledDate}` : "",
      `*Horário de Chegada:* ${route.arrivalTime}hs`,
      `*Horário de Partida (1º Passageiro):* ${route.departureTime}hs (Tempo est. de rota: ${route.estimatedTravelTime})`,
      payment ? `*Pagamento:* ${paymentLabels[payment] || payment}` : "",
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Resumo copiado para a área de transferência!");
  };

  const copyAllRoutes = () => {
    const allText = routes
      .map((route) => {
        const costCenters = route.passengers
          .map((p) => p.costCenter)
          .filter(Boolean)
          .join(" / ");

        return [
          `🚕 *CARRO ${route.vehicleNumber} - ${route.routeName}*`,
          "",
          `Empresa: ${companyName || "[A preencher]"}`,
          `Fone: ${phone || "[A preencher]"}`,
          `Solicitante: ${solicitante || "[A preencher]"}`,
          "",
          `*Passageiros e Origens (Ordem de embarque):*`,
          "",
          ...route.passengers.map(
            (p, i) =>
              `${i + 1}. ${p.name} - ${p.address}${p.phone ? `\n   📱 ${p.phone}` : ""}`
          ),
          "",
          `*Destino:* ${destination || "[A preencher]"}`,
          costCenters ? `*Centro de Custo:* ${costCenters}` : "",
          scheduledDate ? `*Agendamento:* ${scheduledDate}` : "",
          `*Horário de Chegada:* ${route.arrivalTime}hs`,
          `*Horário de Partida (1º Passageiro):* ${route.departureTime}hs (Tempo est. de rota: ${route.estimatedTravelTime})`,
          payment ? `*Pagamento:* ${paymentLabels[payment] || payment}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(allText);
    toast.success("Todas as rotas copiadas!");
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
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">
          Rotas Otimizadas ({routes.length} veículo{routes.length > 1 ? "s" : ""})
        </h2>
        <Button variant="outline" size="sm" className="gap-2" onClick={copyAllRoutes}>
          <Copy className="h-3.5 w-3.5" />
          Copiar Todas
        </Button>
      </div>

      {routes.map((route) => (
        <Card key={route.id} className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Carro {route.vehicleNumber} — {route.routeName}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {route.passengers.length} passageiro{route.passengers.length > 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Company info */}
            <div className="mb-4 space-y-1 text-xs text-muted-foreground">
              <p><strong className="text-foreground">Empresa:</strong> {companyName || "[A preencher]"}</p>
              {scheduledDate && <p><strong className="text-foreground">Agendamento:</strong> {scheduledDate}</p>}
              <p>
                <strong className="text-foreground">Partida:</strong> {route.departureTime}hs →{" "}
                <strong className="text-foreground">Chegada:</strong> {route.arrivalTime}hs{" "}
                <span className="text-muted-foreground/70">(~{route.estimatedTravelTime})</span>
              </p>
            </div>

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
                      {p.costCenter && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">CC: {p.costCenter}</p>
                      )}
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
