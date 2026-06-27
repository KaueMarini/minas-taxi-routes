import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Building2, MapPin, User, Phone, Clock, CreditCard } from "lucide-react";
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
  returnDate: Date | undefined;
  setReturnDate: (d: Date | undefined) => void;
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
  returnDate, setReturnDate,
  returnTime, setReturnTime,
  payment, setPayment,
  solicitante, setSolicitante,
  phone, setPhone,
}: TripFormProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          Dados da Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <CompanySelector selectedCnpj={companyCnpj} onSelect={onCompanySelect} />
        <div className="space-y-1.5">
          <Label htmlFor="dest" className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            Endereço de Destino
          </Label>
          <Input id="dest" placeholder="Av. das Nações, 999 - Vespasiano/MG" value={destination} onChange={(e) => setDestination(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="solicitante" className="flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            Solicitante
          </Label>
          <Input id="solicitante" placeholder="Nome do solicitante" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
            <Phone className="h-3 w-3 text-muted-foreground" />
            Telefone de Contato
          </Label>
          <Input id="phone" placeholder="(31) 99999-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            Data do Agendamento
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-9 w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="arrival" className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            Horário de Chegada
          </Label>
          <Input id="arrival" type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="return" className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            Horário de Retorno <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="return" type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            Data do Retorno <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-9 w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {returnDate ? format(returnDate, "dd/MM/yyyy", { locale: ptBR }) : "Mesma data da ida"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} className="p-3 pointer-events-auto" locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            Forma de Pagamento
          </Label>
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Voucher">Voucher</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
              <SelectItem value="Din">Dinheiro</SelectItem>
              <SelectItem value="ONLINE_PAYMENT">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripForm;
