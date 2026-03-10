import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Map, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import TripForm from "@/components/dashboard/TripForm";
import FileUpload from "@/components/dashboard/FileUpload";
import PassengerTable from "@/components/dashboard/PassengerTable";
import RouteResults from "@/components/dashboard/RouteResults";
import { Passenger, RouteCard } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [routes, setRoutes] = useState<RouteCard[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [destination, setDestination] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [date, setDate] = useState<Date>();
  const [returnTime, setReturnTime] = useState("");
  const [payment, setPayment] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [phone, setPhone] = useState("");

  const handleCompanySelect = useCallback((cnpj: string, name: string) => {
    setCompanyCnpj(cnpj);
    setCompanyName(name);
  }, []);

  const handleFileParsed = useCallback((parsed: Passenger[]) => {
    setPassengers(parsed);
    setRoutes([]);
  }, []);

  const handleOptimize = useCallback(async () => {
    if (passengers.length === 0) return;
    setIsOptimizing(true);
    try {
      const payload = {
        passengers: passengers.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          phone: p.phone,
          costCenter: p.costCenter,
        })),
        destination,
        companyName,
        companyCnpj,
        arrivalTime,
        returnTime,
        payment,
        solicitante,
        phone,
        scheduledDate: date ? format(date, "yyyy-MM-dd") : undefined,
      };

      const response = await fetch(
        "https://webhook.saveautomatik.shop/webhook/TaxiOtimizarRotas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setRoutes(data as RouteCard[]);
      } else if (data.routes && Array.isArray(data.routes)) {
        setRoutes(data.routes as RouteCard[]);
      } else if (data.id && data.passengers) {
        setRoutes([data as RouteCard]);
      } else {
        console.warn("Formato de resposta não reconhecido:", data);
        toast.error("Formato de resposta do servidor não reconhecido.");
      }
    } catch (error) {
      console.error("Erro ao chamar webhook:", error);
      toast.error("Erro ao otimizar rotas. Verifique a conexão com o servidor.");
    } finally {
      setIsOptimizing(false);
    }
  }, [passengers, arrivalTime, destination, companyName, companyCnpj, returnTime, payment, solicitante, phone, date]);

  const handleDeletePassenger = useCallback((id: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleUpdatePassenger = useCallback((id: string, field: keyof Passenger, value: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const handleAddPassenger = useCallback(() => {
    const newId = String(Date.now());
    setPassengers((prev) => [
      ...prev,
      { id: newId, name: "", address: "", phone: "", costCenter: "" },
    ]);
  }, []);

  const scheduledDate = date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground">
                Minas Taxi
              </span>
              <Badge variant="secondary" className="hidden text-[10px] font-medium sm:inline-flex">
                Painel de Rotas
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {session?.user?.email}
            </span>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        {/* Page title */}
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Otimização de Rotas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe passageiros, configure a viagem e gere rotas otimizadas com inteligência artificial.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
          {/* Left column */}
          <div className="space-y-5 animate-slide-up">
            <TripForm
              arrivalTime={arrivalTime} setArrivalTime={setArrivalTime}
              destination={destination} setDestination={setDestination}
              companyCnpj={companyCnpj} companyName={companyName} onCompanySelect={handleCompanySelect}
              date={date} setDate={setDate}
              returnTime={returnTime} setReturnTime={setReturnTime}
              payment={payment} setPayment={setPayment}
              solicitante={solicitante} setSolicitante={setSolicitante}
              phone={phone} setPhone={setPhone}
            />

            <FileUpload onParsed={handleFileParsed} hasPassengers={passengers.length > 0} />

            {passengers.length > 0 && (
              <PassengerTable
                passengers={passengers}
                onDelete={handleDeletePassenger}
                onUpdate={handleUpdatePassenger}
                onAdd={handleAddPassenger}
              />
            )}

            {passengers.length > 0 && (
              <Button
                className="h-12 w-full gap-2.5 text-base font-semibold shadow-md animate-pulse-gold transition-all hover:shadow-lg"
                onClick={handleOptimize}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <Map className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {isOptimizing ? "Analisando endereços e calculando rotas..." : "Otimizar Rotas com IA"}
              </Button>
            )}
          </div>

          {/* Right column */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <RouteResults
              routes={routes}
              isOptimizing={isOptimizing}
              companyName={companyName}
              companyCnpj={companyCnpj}
              destination={destination}
              scheduledDate={scheduledDate}
              arrivalTime={arrivalTime}
              payment={payment}
              solicitante={solicitante}
              phone={phone}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
