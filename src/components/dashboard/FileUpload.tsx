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

function normalizeHeader(h: string): keyof Passenger | "car" | null {
  const lower = h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[°º]/g, "o")
    .replace(/\s+/g, " ")
    .trim();

  if (["nome", "name", "passageiro"].includes(lower)) return "name";
  if (["endereco", "address", "endereco completo"].includes(lower)) return "address";
  if (["celular", "telefone", "phone", "fone", "tel"].includes(lower)) return "phone";
  if (["centro de custo", "costcenter", "cost center", "cc", "centro custo"].includes(lower)) return "costCenter";
  if (["re", "registro", "no centro de custo", "no cc", "numero centro de custo"].includes(lower)) return "re";
  if (["carro", "car", "veiculo", "vehiculo"].includes(lower)) return "car";
  return null;
}

function sanitizeCell(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/[\u0080-\u009F]/g, " ") // control chars comuns de CSV CP1252 mal interpretado
    .replace(/[\u2013\u2014\u2212]/g, "-") // traços especiais
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRows(rows: Record<string, string>[]): Passenger[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const mapping: Record<string, keyof Passenger> = {};
  headers.forEach((h) => { const mapped = normalizeHeader(h); if (mapped) mapping[h] = mapped; });
  const usePositional = Object.keys(mapping).length === 0;

  return rows
    .map((row, i) => {
      const p: Passenger = { id: String(Date.now() + i), name: "", address: "", phone: "", costCenter: "", re: "" };
      if (usePositional) {
        const vals = Object.values(row);
        p.name = sanitizeCell(vals[0]); p.address = sanitizeCell(vals[1]);
        p.phone = sanitizeCell(vals[2]); p.costCenter = sanitizeCell(vals[3]);
        p.re = sanitizeCell(vals[4]);
      } else {
        for (const [col, field] of Object.entries(mapping)) p[field] = sanitizeCell(row[col]);
      }
      return p;
    })
    .filter((p) => p.name.trim() !== "");
}

async function parseFile(file: File): Promise<Passenger[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    const buf = await file.arrayBuffer();

    const utf8Text = new TextDecoder("utf-8").decode(buf);
    const looksBroken = /[\u0080-\u009F]|�|Ã|Â/.test(utf8Text);
    const csvText = looksBroken ? new TextDecoder("windows-1252").decode(buf) : utf8Text;

    const wb = XLSX.read(csvText, { type: "string" });
    return parseRows(XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]], { defval: "" }));
  }
  if (["xlsx", "xls"].includes(ext || "")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { codepage: 1252 });
    return parseRows(XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]], { defval: "" }));
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
      if (passengers.length === 0) toast.error("Nenhum passageiro encontrado.");
      else { onParsed(passengers); toast.success(`${passengers.length} passageiro(s) importado(s)!`); }
    } catch (err: any) { toast.error(err.message || "Erro ao ler arquivo."); }
    finally { setIsParsing(false); }
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
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
      className={`cursor-pointer transition-all duration-200 shadow-sm ${
        isDragging
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : hasPassengers
          ? "border-success/40 bg-success/5"
          : "border-dashed hover:border-primary/50 hover:bg-muted/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-6 text-center">
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
        {isParsing ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Lendo arquivo...</p>
          </>
        ) : hasPassengers ? (
          <>
            <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
            <p className="text-sm font-medium text-foreground">Arquivo importado com sucesso</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Clique para importar outro arquivo</p>
          </>
        ) : (
          <>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Arraste ou clique para importar passageiros</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-3 w-3" />
              CSV ou Excel (.xlsx, .xls)
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
