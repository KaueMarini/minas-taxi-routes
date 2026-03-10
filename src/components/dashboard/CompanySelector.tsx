import { useState, useMemo } from "react";
import { Company, loadCompanies, addCompany } from "@/lib/companies";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CompanySelectorProps {
  selectedCnpj: string;
  onSelect: (cnpj: string, name: string) => void;
}

const CompanySelector = ({ selectedCnpj, onSelect }: CompanySelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newCode, setNewCode] = useState("");

  const selected = useMemo(
    () => companies.find((c) => c.cnpj === selectedCnpj),
    [companies, selectedCnpj]
  );

  const handleAdd = () => {
    if (!newName.trim() || !newCnpj.trim()) {
      toast.error("Preencha o nome e o CNPJ.");
      return;
    }
    if (companies.some((c) => c.cnpj === newCnpj.trim())) {
      toast.error("CNPJ já cadastrado.");
      return;
    }
    const updated = addCompany(companies, {
      code: newCode.trim() || "0",
      name: newName.trim().toUpperCase(),
      cnpj: newCnpj.trim(),
    });
    setCompanies(updated);
    onSelect(newCnpj.trim(), newName.trim().toUpperCase());
    setNewName("");
    setNewCnpj("");
    setNewCode("");
    setDialogOpen(false);
    toast.success("Empresa cadastrada com sucesso!");
  };

  return (
    <div className="space-y-1.5">
      <Label>Empresa</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selected ? (
              <span className="truncate">
                {selected.code} – {selected.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Selecione a empresa</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar empresa..." />
            <CommandList>
              <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
              <CommandGroup>
                {companies.map((c) => (
                  <CommandItem
                    key={c.cnpj}
                    value={`${c.code} ${c.name} ${c.cnpj}`}
                    onSelect={() => {
                      onSelect(c.cnpj, c.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCnpj === c.cnpj ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{c.code} – {c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.cnpj}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => {
                  setOpen(false);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Cadastrar nova empresa
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Cadastrar Nova Empresa
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Nome da Empresa</Label>
              <Input id="new-name" placeholder="Ex: DELP ENGENHARIA" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-cnpj">CNPJ</Label>
              <Input id="new-cnpj" placeholder="00.000.000/0000-00" value={newCnpj} onChange={(e) => setNewCnpj(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-code">Código <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="new-code" placeholder="Ex: 284" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySelector;
