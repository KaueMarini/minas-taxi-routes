import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CompanySelector from "./CompanySelector";

interface TripFormProps {
  arrivalTime: string;
  setArrivalTime: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  companyCnpj: string;
  companyName: string;
  onCompanySelect: (cnpj: string, name: string) => void;
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  returnTime: string;
  setReturnTime: (v: string) => void;
  payment: string;
  setPayment: (v: string) => void;
  solicitante: string;
  setSolicitante: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
}

const TripForm = ({
  arrivalTime, setArrivalTime,
  destination, setDestination,
  companyCnpj, companyName, onCompanySelect,
  date, setDate,
  returnTime, setReturnTime,
  payment, setPayment,
  solicitante, setSolicitante,
  phone, setPhone,
}: TripFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Dados da Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Nome da Empresa</Label>
          <Input id="company" placeholder="Ex: 284 – Delp Engenharia" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dest">Endereço de Destino</Label>
          <Input id="dest" placeholder="Av. das Nações, 999 - Distrito Industrial - Vespasiano/MG" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="solicitante">Solicitante</Label>
          <Input id="solicitante" placeholder="Nome do solicitante" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone de Contato</Label>
          <Input id="phone" placeholder="(31) 99999-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Data do Agendamento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="arrival">Horário de Chegada</Label>
          <Input id="arrival" type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="return">Horário de Retorno <span className="text-muted-foreground">(opcional)</span></Label>
          <Input id="return" type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Forma de Pagamento</Label>
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="faturado">Faturado</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
              <SelectItem value="cartao">Cartão Corporativo</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripForm;
