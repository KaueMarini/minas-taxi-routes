import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Passenger } from "@/lib/mock-data";
import { Trash2, UserPlus, Users } from "lucide-react";

interface PassengerTableProps {
  passengers: Passenger[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: keyof Passenger, value: string) => void;
  onAdd: () => void;
}

const PassengerTable = ({ passengers, onDelete, onUpdate, onAdd }: PassengerTableProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Passageiros
          </span>
          <Badge variant="secondary" className="text-xs font-medium">
            {passengers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[160px] text-xs">Nome</TableHead>
                <TableHead className="min-w-[200px] text-xs">Endereço</TableHead>
                <TableHead className="min-w-[130px] text-xs">Celular</TableHead>
                <TableHead className="min-w-[100px] text-xs">Centro de Custo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {passengers.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell className="p-1">
                    <Input value={p.name} onChange={(e) => onUpdate(p.id, "name", e.target.value)}
                      className="h-8 border-transparent bg-transparent text-sm hover:border-input focus:border-input" />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input value={p.address} onChange={(e) => onUpdate(p.id, "address", e.target.value)}
                      className="h-8 border-transparent bg-transparent text-sm hover:border-input focus:border-input" />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input value={p.phone} onChange={(e) => onUpdate(p.id, "phone", e.target.value)}
                      className="h-8 border-transparent bg-transparent text-sm hover:border-input focus:border-input" />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input value={p.costCenter} onChange={(e) => onUpdate(p.id, "costCenter", e.target.value)}
                      className="h-8 border-transparent bg-transparent text-sm hover:border-input focus:border-input" />
                  </TableCell>
                  <TableCell className="p-1">
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      onClick={() => onDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t px-4 py-2.5">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary hover:text-primary" onClick={onAdd}>
            <UserPlus className="h-3.5 w-3.5" />
            Adicionar passageiro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengerTable;
