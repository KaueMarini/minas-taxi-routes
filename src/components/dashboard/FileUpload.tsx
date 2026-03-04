import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  onUpload: () => void;
  hasPassengers: boolean;
}

const FileUpload = ({ onUpload, hasPassengers }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onUpload();
    },
    [onUpload]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = () => {
    onUpload();
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
      onClick={handleClick}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          className="hidden"
          onChange={handleChange}
        />
        {hasPassengers ? (
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
            <p className="font-medium text-foreground">
              Arraste a lista de passageiros ou clique para fazer upload
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <FileSpreadsheet className="mr-1 inline h-3.5 w-3.5" />
              CSV, Excel ou PDF
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
