import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RouteCard } from "@/lib/mock-data";
import { Car, Copy, MapPin, Clock, Loader2, Navigation, Send, FileDown, CheckCircle2, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateRoutesPDF } from "@/lib/pdf-export";

const DEFAULT_MOTIVOS = [
  "2º TURNO",
  "3º TURNO",
  "CONVENCIONAL",
  "H.E FDS",
  "H.E SEMANAL",
  "JOVEM APRENDIZ",
  "LAGOA SANTA",
];
const MOTIVOS_STORAGE_KEY = "route_motivos_v1";

interface RouteResultsProps {
  routes: RouteCard[];
  isOptimizing: boolean;
  companyName: string;
  companyCnpj: string;
  destination: string;
  scheduledDate?: string;
  scheduledReturnDate?: string;
  arrivalTime: string;
  returnTime?: string;
  payment?: string;
  solicitante?: string;
  phone?: string;
}

const paymentLabels: Record<string, string> = {
  Voucher: "Voucher",
  Pix: "PIX",
  Din: "Dinheiro",
  ONLINE_PAYMENT: "Boleto Eletrônico",
};

const RouteResults = ({
  routes,
  isOptimizing,
  companyName,
  companyCnpj,
  destination,
  scheduledDate,
  scheduledReturnDate,
  arrivalTime,
  returnTime,
  payment,
  solicitante,
  phone,
}: RouteResultsProps) => {
  const [sendingRouteId, setSendingRouteId] = useState<string | null>(null);
  const [sentRoutes, setSentRoutes] = useState<Set<string>>(new Set());
  const [routeReasons, setRouteReasons] = useState<Record<string, string>>({});
  const [routePrices, setRoutePrices] = useState<Record<string, string>>({});
  const [motivos, setMotivos] = useState<string[]>(DEFAULT_MOTIVOS);
  const [newMotivo, setNewMotivo] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MOTIVOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMotivos(parsed);
      }
    } catch {}
  }, []);

  const persistMotivos = (list: string[]) => {
    setMotivos(list);
    try { localStorage.setItem(MOTIVOS_STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  const addMotivo = () => {
    const v = newMotivo.trim().toUpperCase();
    if (!v) return;
    if (motivos.includes(v)) {
      toast.error("Esse motivo já existe");
      return;
    }
    persistMotivos([...motivos, v]);
    setNewMotivo("");
    toast.success(`Motivo "${v}" adicionado`);
  };

  const removeMotivo = (m: string) => {
    persistMotivos(motivos.filter((x) => x !== m));
  };

  useEffect(() => {
    if (routes.length === 0) {
      setSendingRouteId(null);
      setSentRoutes(new Set());
    }
  }, [routes]);

  const sendRouteToWebhook = async (route: RouteCard) => {
    setSendingRouteId(route.id);
    try {
      const payload = {
        trip: {
          company: companyCnpj || "",
          requester: solicitante || "",
          requesterPhone: phone || "",
          scheduledDate: scheduledDate || "",
          arrivalTime: route.arrivalTime,
          returnTime: returnTime || "",
          horario_retorno: returnTime || "",
          scheduledReturnDate: scheduledReturnDate || scheduledDate || "",
          departureTime: route.departureTime,
          estimatedTravelTime: route.estimatedTravelTime,
          vehicleNumber: route.vehicleNumber,
          routeName: route.routeName,
          payment: payment || "",
          extra1: routeReasons[route.id] || "",
          serviceTime: route.passengers[0]?.serviceTime || "",
          passengers: route.passengers.map((p, i) => ({
            passengerId: i + 1, sequence: (i + 1) * 2 - 1,
            name: p.name, phone: p.phone || "",
            passenger_cost_center: p.costCenter || "",
            re: p.re || "",
            serviceTime: p.serviceTime || "",
            pickup: { address: p.address },
          })),
          destinations: route.passengers.map((p, i) => ({
            passengerId: i + 1, sequence: (i + 1) * 2,
            location: { address: destination || "" },
          })),
        },
        webhookUrl: "https://n8n.srv1497518.hstgr.cloud/webhook/apiTaxi2",
        executionMode: "production",
      };

      const response = await fetch("https://n8n.srv1497518.hstgr.cloud/webhook/apiTaxi2", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const rawPrice = (routePrices[route.id] || "").replace(",", ".").trim();
      const priceValue = rawPrice === "" ? null : Number(rawPrice);
      const { error: dbError } = await supabase.from("rides").insert({
        company_name: companyName || null,
        company_cnpj: companyCnpj || null,
        destination: destination || null,
        route_name: route.routeName,
        vehicle_number: route.vehicleNumber,
        scheduled_date: scheduledDate || null,
        arrival_time: route.arrivalTime || null,
        return_time: returnTime || null,
        departure_time: route.departureTime || null,
        estimated_travel_time: route.estimatedTravelTime || null,
        service_time: route.passengers[0]?.serviceTime || null,
        payment: payment || null,
        reason: routeReasons[route.id] || null,
        solicitante: solicitante || null,
        phone: phone || null,
        price: priceValue !== null && !Number.isNaN(priceValue) ? priceValue : null,
        passengers: route.passengers.map((p) => ({
          name: p.name,
          address: p.address,
          phone: p.phone || "",
          costCenter: p.costCenter || "",
          re: p.re || "",
          serviceTime: p.serviceTime || "",
        })),
      });
      if (dbError) {
        console.error("Erro ao registrar corrida:", dbError);
        toast.warning("Corrida enviada, mas não foi registrada no histórico.");
      }

      setSentRoutes((prev) => new Set(prev).add(route.id));
      toast.success(`Carro ${route.vehicleNumber} enviado e registrado!`);
    } catch (error) {
      console.error("Erro ao enviar rota:", error);
      toast.error(`Erro ao enviar Carro ${route.vehicleNumber}.`);
    } finally {
      setSendingRouteId(null);
    }
  };

  const buildRouteText = (route: RouteCard) => {
    const costCenters = route.passengers.map((p) => p.costCenter).filter(Boolean).join(" / ");
    const serviceTime = route.passengers[0]?.serviceTime;
    return [
      `🚕 *CARRO ${route.vehicleNumber} - ${route.routeName}*`, "",
      `Empresa: ${companyName || "[A preencher]"}`,
      `Fone: ${phone || "[A preencher]"}`,
      `Solicitante: ${solicitante || "[A preencher]"}`,
      serviceTime ? `Horário de Atendimento: ${serviceTime}h` : "", "",
      `*Passageiros e Origens (Ordem de embarque):*`, "",
      ...route.passengers.map((p, i) =>
        `${i + 1}. ${p.name} - ${p.address}${p.phone ? `\n   📱 ${p.phone}` : ""}`
      ), "",
      `*Destino:* ${destination || "[A preencher]"}`,
      costCenters ? `*Centro de Custo:* ${costCenters}` : "",
      scheduledDate ? `*Agendamento:* ${scheduledDate}` : "",
      `*Horário de Chegada:* ${route.arrivalTime}hs`,
      returnTime ? `*Horário de Retorno:* ${returnTime}hs` : "",
      `*Horário de Partida (1º Passageiro):* ${route.departureTime}hs (Tempo est. de rota: ${route.estimatedTravelTime})`,
      payment ? `*Pagamento:* ${paymentLabels[payment] || payment}` : "",
    ].filter(Boolean).join("\n");
  };

  const copyRoute = (route: RouteCard) => {
    navigator.clipboard.writeText(buildRouteText(route));
    toast.success("Resumo copiado!");
  };

  const copyAllRoutes = () => {
    navigator.clipboard.writeText(routes.map(buildRouteText).join("\n\n---\n\n"));
    toast.success("Todas as rotas copiadas!");
  };

  const handleExportPDF = () => {
    generateRoutesPDF(routes, { companyName, destination, scheduledDate, arrivalTime, payment, solicitante, phone });
    toast.success("PDF exportado com sucesso!");
  };

  if (isOptimizing) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <p className="font-display text-lg font-semibold text-foreground">Calculando rotas...</p>
        <p className="mt-1 text-sm text-muted-foreground">Nosso algoritmo está otimizando os trajetos</p>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Navigation className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="font-display text-base font-semibold text-muted-foreground">Resultados da Otimização</p>
        <p className="mt-1 max-w-[240px] text-xs text-muted-foreground/70">
          Importe passageiros e clique em "Otimizar Rotas com IA" para ver as rotas sugeridas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Rotas Otimizadas
          </h2>
          <p className="text-xs text-muted-foreground">
            {routes.length} veículo{routes.length > 1 ? "s" : ""} · {routes.reduce((a, r) => a + r.passengers.length, 0)} passageiros
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExportPDF}>
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={copyAllRoutes}>
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </Button>
        </div>
      </div>

      {routes.map((route) => (
        <Card key={route.id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="bg-muted/50 py-3 pb-2.5">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                  {route.vehicleNumber}
                </div>
                <span className="font-display font-semibold">{route.routeName}</span>
                {sentRoutes.has(route.id) && (
                  <Badge variant="secondary" className="gap-1 bg-success/10 text-[10px] text-success">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Enviado
                  </Badge>
                )}
              </span>
              <Badge variant="outline" className="text-[10px] font-normal">
                {route.passengers.length} pass.
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {/* Info row */}
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span><strong className="text-foreground">Empresa:</strong> {companyName || "—"}</span>
              {scheduledDate && <span><strong className="text-foreground">Data:</strong> {scheduledDate}</span>}
              {returnTime && <span><strong className="text-foreground">Retorno:</strong> {returnTime}h</span>}
              {route.passengers[0]?.serviceTime && (
                <span><strong className="text-foreground">Horário de Atendimento:</strong> {route.passengers[0].serviceTime}h</span>
              )}
              <span>
                <strong className="text-foreground">Partida:</strong> {route.departureTime}h →{" "}
                <strong className="text-foreground">Chegada:</strong> {route.arrivalTime}h{" "}
                <span className="text-muted-foreground/60">(~{route.estimatedTravelTime})</span>
              </span>
            </div>

            {/* Timeline */}
            <div className="relative ml-2.5 border-l-2 border-primary/20 pb-1 pl-5">
              {route.passengers.map((p, idx) => (
                <div key={p.id} className="relative mb-4 last:mb-2">
                  <div className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{p.address}</p>
                      {p.costCenter && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/60">CC: {p.costCenter}</p>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {route.pickupTimes[idx]}
                    </span>
                  </div>
                </div>
              ))}
              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground shadow-sm">
                  <MapPin className="h-2.5 w-2.5 text-primary" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{companyName || "Destino"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{destination || "Endereço de destino"}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-primary">
                    <Clock className="h-2.5 w-2.5" />
                    {route.arrivalTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex gap-1.5">
                <Select
                  value={routeReasons[route.id] || ""}
                  onValueChange={(val) => setRouteReasons((prev) => ({ ...prev, [route.id]: val }))}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs">
                    <SelectValue placeholder="Motivo da corrida (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivos.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 shrink-0 p-0" title="Gerenciar motivos">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="end">
                    <p className="mb-2 text-xs font-semibold">Gerenciar motivos</p>
                    <div className="mb-2 flex gap-1.5">
                      <Input
                        value={newMotivo}
                        onChange={(e) => setNewMotivo(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMotivo(); } }}
                        placeholder="Novo motivo"
                        className="h-8 text-xs"
                      />
                      <Button size="sm" className="h-8 px-2" onClick={addMotivo}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {motivos.map((m) => (
                        <div key={m} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                          <span>{m}</span>
                          <button onClick={() => removeMotivo(m)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 flex-1 gap-1.5 text-xs" onClick={() => copyRoute(route)}>
                <Copy className="h-3 w-3" /> Copiar
              </Button>
              <Button size="sm"
                className="h-8 flex-1 gap-1.5 text-xs shadow-sm"
                onClick={() => sendRouteToWebhook(route)}
                disabled={sendingRouteId === route.id}
              >
                {sentRoutes.has(route.id) ? (
                  <><CheckCircle2 className="h-3 w-3" /> Enviado</>
                ) : sendingRouteId === route.id ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="h-3 w-3" /> Enviar Corrida</>
                )}
            </Button>
            </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RouteResults;
