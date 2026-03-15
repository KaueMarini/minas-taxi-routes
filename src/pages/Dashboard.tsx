import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
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

  const buildRoutesFromCars = useCallback((parsed: Passenger[], arrTime: string): RouteCard[] => {
    const groups: Record<string, Passenger[]> = {};
    parsed.forEach((p) => {
      const car = p.car || "Sem Carro";
      if (!groups[car]) groups[car] = [];
      groups[car].push(p);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    return sortedKeys.map((carName, idx) => {
      const carPassengers = groups[carName];
      const vehicleNumber = parseInt(carName.replace(/\D/g, "")) || idx + 1;
      return {
        id: `car-${vehicleNumber}`,
        vehicleNumber,
        routeName: carName,
        passengers: carPassengers,
        departureTime: "",
        pickupTimes: carPassengers.map(() => ""),
        arrivalTime: arrTime,
        estimatedTravelTime: "",
      };
    });
  }, []);

  const handleFileParsed = useCallback((parsed: Passenger[]) => {
    setPassengers(parsed);
    const generatedRoutes = buildRoutesFromCars(parsed, arrivalTime);
    setRoutes(generatedRoutes);
    toast.success(`${parsed.length} passageiro(s) em ${generatedRoutes.length} carro(s)!`);
  }, [arrivalTime, buildRoutesFromCars]);

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
      { id: newId, name: "", address: "", phone: "", costCenter: "", re: "", car: "" },
    ]);
  }, []);

  const scheduledDate = date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Minas Táxi" className="h-8 w-8 rounded-lg shadow-sm" />
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground">
                Minas Táxi
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

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Gerenciamento de Rotas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe passageiros com os carros definidos e gerencie as rotas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
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
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <RouteResults
              routes={routes}
              isOptimizing={false}
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