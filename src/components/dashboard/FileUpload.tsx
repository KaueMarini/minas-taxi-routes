import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Passenger } from "@/lib/mock-data";

interface FileUploadProps {
  onParsed: (passengers: Passenger[]) => void;
  hasPassengers: boolean;
}

function normalizeHeader(h: string): keyof Passenger | null {
  const lower = h.toLowerCase().trim();
  if (["nome", "name", "passageiro"].includes(lower)) return "name";
  if (["endereço", "endereco", "address", "endereço completo"].includes(lower)) return "address";
  if (["celular", "telefone", "phone", "fone", "tel"].includes(lower)) return "phone";
  if (["centro de custo", "costcenter", "cost center", "cc", "centro custo"].includes(lower)) return "costCenter";
  return null;
}

function parseRows(rows: Record<string, string>[]): Passenger[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const mapping: Record<string, keyof Passenger> = {};
  headers.forEach((h) => {
    const mapped = normalizeHeader(h);
    if (mapped) mapping[h] = mapped;
  });

  // Fallback: if no headers matched, assume column order: name, address, phone, costCenter
  const usePositional = Object.keys(mapping).length === 0;

  return rows
    .map((row, i) => {
      const p: Passenger = { id: String(Date.now() + i), name: "", address: "", phone: "", costCenter: "" };
      if (usePositional) {
        const vals = Object.values(row);
        p.name = String(vals[0] ?? "");
        p.address = String(vals[1] ?? "");
        p.phone = String(vals[2] ?? "");
        p.costCenter = String(vals[3] ?? "");
      } else {
        for (const [col, field] of Object.entries(mapping)) {
          p[field] = String(row[col] ?? "");
        }
      }
      return p;
    })
    .filter((p) => p.name.trim() !== "");
}

async function parseFile(file: File): Promise<Passenger[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    const text = await file.text();
    const wb = XLSX.read(text, { type: "string" });
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
    return parseRows(rows);
  }

  if (["xlsx", "xls"].includes(ext || "")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
    return parseRows(rows);
  }

  throw new Error("Formato não suportado. Use CSV ou Excel.");
}

const FileUpload = ({ onParsed, hasPassengers }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      const passengers = await parseFile(file);
      if (passengers.length === 0) {
        toast.error("Nenhum passageiro encontrado no arquivo.");
      } else {
        onParsed(passengers);
        toast.success(`${passengers.length} passageiro(s) importado(s) com sucesso!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao ler arquivo.");
    } finally {
      setIsParsing(false);
    }
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isDragging
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : hasPassengers
          ? "border-primary/40 bg-primary/5"
          : "border-dashed hover:border-primary/50 hover:bg-muted/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
        {isParsing ? (
          <>
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
            <p className="font-medium text-foreground">Lendo arquivo...</p>
          </>
        ) : hasPassengers ? (
          <>
            <CheckCircle2 className="mb-3 h-10 w-10 text-primary" />
            <p className="font-medium text-foreground">Arquivo importado com sucesso</p>
            <p className="mt-1 text-sm text-muted-foreground">Clique para importar outro arquivo</p>
          </>
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium text-foreground">Arraste a lista de passageiros ou clique para fazer upload</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <FileSpreadsheet className="mr-1 inline h-3.5 w-3.5" />
              CSV ou Excel (.xlsx, .xls)
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
