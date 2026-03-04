import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, LogOut } from "lucide-react";
import TripForm from "@/components/dashboard/TripForm";
import FileUpload from "@/components/dashboard/FileUpload";
import PassengerTable from "@/components/dashboard/PassengerTable";
import RouteResults from "@/components/dashboard/RouteResults";
import { Passenger, RouteCard, MOCK_PASSENGERS, generateRoutes } from "@/lib/mock-data";
import { Map } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [routes, setRoutes] = useState<RouteCard[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [destination, setDestination] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleFileUpload = useCallback(() => {
    setPassengers([...MOCK_PASSENGERS]);
    setRoutes([]);
  }, []);

  const handleOptimize = useCallback(() => {
    if (passengers.length === 0) return;
    setIsOptimizing(true);
    setTimeout(() => {
      const result = generateRoutes(passengers, arrivalTime, destination);
      setRoutes(result);
      setIsOptimizing(false);
    }, 2200);
  }, [passengers, arrivalTime, destination]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => navigate("/")}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            <TripForm
              arrivalTime={arrivalTime}
              setArrivalTime={setArrivalTime}
              destination={destination}
              setDestination={setDestination}
              companyName={companyName}
              setCompanyName={setCompanyName}
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
                {isOptimizing ? "Analisando endereços e calculando rotas..." : "Otimizar Rotas com IA"}
              </Button>
            )}
          </div>

          {/* Right Column */}
          <div>
            <RouteResults
              routes={routes}
              isOptimizing={isOptimizing}
              companyName={companyName}
              destination={destination}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
