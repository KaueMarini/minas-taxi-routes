import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, LogOut, Map } from "lucide-react";
import TripForm from "@/components/dashboard/TripForm";
import FileUpload from "@/components/dashboard/FileUpload";
import PassengerTable from "@/components/dashboard/PassengerTable";
import RouteResults from "@/components/dashboard/RouteResults";
import { Passenger, RouteCard, MOCK_PASSENGERS } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [routes, setRoutes] = useState<RouteCard[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [destination, setDestination] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [date, setDate] = useState<Date>();
  const [returnTime, setReturnTime] = useState("");
  const [payment, setPayment] = useState("");
  const [solicitante, setSolicitante] = useState("");
  const [phone, setPhone] = useState("");

  const handleFileUpload = useCallback(() => {
    // Mantido como MOCK apenas para demonstração visual do upload.
    // Numa versão final real, aqui você processaria o Excel e setaria no setPassengers
    setPassengers([...MOCK_PASSENGERS]);
    setRoutes([]);
  }, []);

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

  // ==========================================
  // NOVA INTEGRAÇÃO COM O N8N (WEBHOOK)
  // ==========================================
  const handleOptimize = useCallback(async () => {
    if (passengers.length === 0) return;
    
    if (!destination) {
      toast.error("Por favor, preencha o endereço de destino da empresa.");
      return;
    }

    setIsOptimizing(true);
    setRoutes([]); // Limpa as rotas antigas da tela

    try {
      // Monta o pacote de dados exato que o seu n8n vai receber
      const payload = {
        empresa_cnpj: companyName,
        solicitante: solicitante,
        telefone: phone,
        pagamento: payment,
        data_agendamento: scheduledDate,
        horario_chegada: arrivalTime,
        destino_final: destination,
        passageiros: passengers
      };

      // Dispara a requisição para o seu n8n
      const response = await fetch("https://webhook.saveautomatik.shop/webhook/TaxiOtimizarRotas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha na comunicação com o servidor de IA.");
      }

      // O n8n precisa devolver um array no formato RouteCard[]
      const data = await response.json();
      
      setRoutes(data);
      toast.success("Rotas otimizadas com sucesso!");

    } catch (error) {
      console.error("Erro ao otimizar:", error);
      toast.error("Ocorreu um erro ao calcular as rotas. Tente novamente.");
    } finally {
      setIsOptimizing(false);
    }
  }, [passengers, arrivalTime, destination, companyName, solicitante, phone, payment, scheduledDate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Minas Taxi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Olá, <strong className="text-foreground">Operador</strong>
            </span>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => navigate("/")}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <TripForm
              arrivalTime={arrivalTime} setArrivalTime={setArrivalTime}
              destination={destination} setDestination={setDestination}
              companyName={companyName} setCompanyName={setCompanyName}
              date={date} setDate={setDate}
              returnTime={returnTime} setReturnTime={setReturnTime}
              payment={payment} setPayment={setPayment}
              solicitante={solicitante} setSolicitante={setSolicitante}
              phone={phone} setPhone={setPhone}
            />

            <FileUpload onUpload={handleFileUpload} hasPassengers={passengers.length > 0} />

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
                className="h-12 w-full gap-2 text-base font-semibold animate-pulse-gold"
                onClick={handleOptimize}
                disabled={isOptimizing}
              >
                <Map className="h-5 w-5" />
                {isOptimizing ? "Enviando para a IA..." : "Otimizar Rotas com IA"}
              </Button>
            )}
          </div>

          <div>
            <RouteResults
              routes={routes}
              isOptimizing={isOptimizing}
              companyName={companyName}
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