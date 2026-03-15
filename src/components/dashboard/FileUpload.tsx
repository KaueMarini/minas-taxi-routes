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

function normalizeColumnName(name: string): string {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[°º]/g, "o")
    .replace(/[_\s]+/g, " ")
    .trim();
}

type FieldKey = "name" | "address" | "phone" | "costCenter" | "re" | "car";

const fieldAliases: Record<FieldKey, string[]> = {
  name: ["nome", "name", "passageiro"],
  address: ["endereco", "address", "endereco completo", "end"],
  phone: ["celular", "telefone", "phone", "fone", "tel"],
  costCenter: ["centro de custo", "costcenter", "cost center", "cc", "centro custo"],
  re: ["re", "registro", "no centro de custo", "no cc", "numero centro de custo"],
  car: ["carro", "car", "veiculo", "vehiculo", "vehicle"],
};

function findFieldForHeader(header: string): FieldKey | null {
  const normalized = normalizeColumnName(header);
  if (!normalized) return null;

  // Priority 1: Exact match
  for (const [field, aliases] of Object.entries(fieldAliases)) {
    if (aliases.some((a) => normalizeColumnName(a) === normalized)) return field as FieldKey;
  }

  // Priority 2: Starts with
  for (const [field, aliases] of Object.entries(fieldAliases)) {
    if (aliases.some((a) => normalized.startsWith(normalizeColumnName(a)))) return field as FieldKey;
  }

  // Priority 3: Contains
  for (const [field, aliases] of Object.entries(fieldAliases)) {
    if (aliases.some((a) => normalized.includes(normalizeColumnName(a)))) return field as FieldKey;
  }

  return null;
}

function sanitizeCell(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[\u0080-\u009F]/g, " ")
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRows(rows: Record<string, string>[]): Passenger[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);

  // Build mapping using flexible matching
  const mapping: Record<string, FieldKey> = {};
  const usedFields = new Set<FieldKey>();
  headers.forEach((h) => {
    const field = findFieldForHeader(h);
    if (field && !usedFields.has(field)) {
      mapping[h] = field;
      usedFields.add(field);
    }
  });

  console.log("Detected column mapping:", mapping);

  return rows
    .map((row, i) => {
      const p: Passenger = { id: String(Date.now() + i), name: "", address: "", phone: "", costCenter: "", re: "", car: "" };
      for (const [col, field] of Object.entries(mapping)) {
        (p as any)[field] = sanitizeCell(row[col]);
      }
      // Clean phone/RE: remove ".0" suffix from numeric imports
      p.phone = p.phone.replace(/\.0$/, "");
      p.re = p.re.replace(/\.0$/, "");
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