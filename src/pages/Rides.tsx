import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Trash2, Car, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface RidePassenger {
  name?: string;
  address?: string;
  phone?: string;
  costCenter?: string;
  re?: string;
}

interface Ride {
  id: string;
  company_name: string | null;
  company_cnpj: string | null;
  destination: string | null;
  route_name: string | null;
  vehicle_number: number | null;
  scheduled_date: string | null;
  arrival_time: string | null;
  departure_time: string | null;
  return_time: string | null;
  payment: string | null;
  reason: string | null;
  price: number | null;
  passengers: RidePassenger[];
  created_at: string;
}

const paymentLabels: Record<string, string> = {
  Voucher: "Voucher",
  Pix: "PIX",
  Din: "Dinheiro",
  ONLINE_PAYMENT: "Boleto Eletrônico",
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Rides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar corridas");
    } else {
      setRides((data ?? []) as unknown as Ride[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () => rides.reduce((acc, r) => acc + (Number(r.price) || 0), 0),
    [rides]
  );

  const savePrice = async (ride: Ride) => {
    const raw = (drafts[ride.id] ?? "").replace(",", ".").trim();
    const value = raw === "" ? null : Number(raw);
    if (value !== null && Number.isNaN(value)) {
      toast.error("Preço inválido");
      return;
    }
    setSavingId(ride.id);
    const { error } = await supabase
      .from("rides")
      .update({ price: value })
      .eq("id", ride.id);
    setSavingId(null);
    if (error) {
      toast.error("Não foi possível salvar o preço");
      return;
    }
    setRides((prev) =>
      prev.map((r) => (r.id === ride.id ? { ...r, price: value } : r))
    );
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[ride.id];
      return next;
    });
    toast.success("Preço salvo!");
  };

  const removeRide = async (id: string) => {
    const { error } = await supabase.from("rides").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir");
      return;
    }
    setRides((prev) => prev.filter((r) => r.id !== id));
    toast.success("Corrida removida");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Minas Táxi" className="h-8 w-8 rounded-lg shadow-sm" />
            <span className="font-display text-lg font-bold text-foreground">Corridas Enviadas</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <Link to="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao painel
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Histórico de Corridas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rides.length} corrida{rides.length === 1 ? "" : "s"} registrada{rides.length === 1 ? "" : "s"} · informe o preço de cada uma.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
            <DollarSign className="h-3.5 w-3.5" />
            Total: {brl(total)}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border bg-card py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rides.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card/50 py-20 text-center">
            <Car className="mx-auto mb-3 h-7 w-7 text-muted-foreground/50" />
            <p className="font-display text-base font-semibold text-muted-foreground">
              Nenhuma corrida registrada ainda
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              As corridas enviadas no painel aparecem aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Card key={ride.id} className="shadow-sm">
                <CardHeader className="bg-muted/50 py-3 pb-2.5">
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                        {ride.vehicle_number ?? "-"}
                      </div>
                      <span className="font-display font-semibold">{ride.route_name || "Rota"}</span>
                      {ride.reason && (
                        <Badge variant="outline" className="text-[10px] font-normal">{ride.reason}</Badge>
                      )}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      Enviada em {new Date(ride.created_at).toLocaleString("pt-BR")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span><strong className="text-foreground">Empresa:</strong> {ride.company_name || ride.company_cnpj || "—"}</span>
                    {ride.scheduled_date && <span><strong className="text-foreground">Data:</strong> {ride.scheduled_date}</span>}
                    <span><strong className="text-foreground">Partida:</strong> {ride.departure_time || "—"} → <strong className="text-foreground">Chegada:</strong> {ride.arrival_time || "—"}</span>
                    {ride.payment && <span><strong className="text-foreground">Pagamento:</strong> {paymentLabels[ride.payment] || ride.payment}</span>}
                  </div>

                  <p className="mb-1 text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Destino:</strong> {ride.destination || "—"}
                  </p>
                  <ul className="mb-3 space-y-0.5 text-[11px] text-muted-foreground">
                    {(ride.passengers || []).map((p, i) => (
                      <li key={i} className="truncate">
                        {i + 1}. <span className="font-medium text-foreground">{p.name}</span> — {p.address}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Preço (R$)</span>
                      <Input
                        value={drafts[ride.id] ?? (ride.price != null ? String(ride.price) : "")}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [ride.id]: e.target.value }))}
                        placeholder="0,00"
                        inputMode="decimal"
                        className="h-8 w-28 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => savePrice(ride)}
                      disabled={savingId === ride.id}
                    >
                      {savingId === ride.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Salvar preço
                    </Button>
                    {ride.price != null && (
                      <Badge variant="secondary" className="text-[11px]">
                        {brl(Number(ride.price))}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeRide(ride.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rides;
