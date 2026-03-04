import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Passageiros ({passengers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Nome</TableHead>
                <TableHead className="min-w-[200px]">Endereço Completo</TableHead>
                <TableHead className="min-w-[140px]">Celular</TableHead>
                <TableHead className="min-w-[100px]">Centro de Custo</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {passengers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={p.name}
                      onChange={(e) => onUpdate(p.id, "name", e.target.value)}
                      className="h-8 border-transparent bg-transparent hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={p.address}
                      onChange={(e) => onUpdate(p.id, "address", e.target.value)}
                      className="h-8 border-transparent bg-transparent hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={p.phone}
                      onChange={(e) => onUpdate(p.id, "phone", e.target.value)}
                      className="h-8 border-transparent bg-transparent hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={p.costCenter}
                      onChange={(e) => onUpdate(p.id, "costCenter", e.target.value)}
                      className="h-8 border-transparent bg-transparent hover:border-input focus:border-input"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t px-4 py-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={onAdd}>
            <UserPlus className="h-4 w-4" />
            Adicionar passageiro manualmente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengerTable;
