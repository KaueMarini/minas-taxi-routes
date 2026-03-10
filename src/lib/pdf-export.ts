import jsPDF from "jspdf";
import { RouteCard } from "./mock-data";

const paymentLabels: Record<string, string> = {
  faturado: "Faturado",
  cartao: "Cartão Corporativo",
  pix: "PIX",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

interface PDFOptions {
  companyName: string;
  destination: string;
  scheduledDate?: string;
  arrivalTime: string;
  payment?: string;
  solicitante?: string;
  phone?: string;
}

export function generateRoutesPDF(routes: RouteCard[], opts: PDFOptions) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const gold = [212, 160, 23] as [number, number, number];
  const dark = [30, 35, 40] as [number, number, number];
  const gray = [120, 125, 130] as [number, number, number];
  const lightBg = [245, 246, 250] as [number, number, number];

  const checkNewPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageW, 28, "F");

  // Add logo
  try {
    const logoUrl = window.location.origin + "/images/logo.png";
    doc.addImage(logoUrl, "PNG", margin, 2, 24, 24);
  } catch {
    // fallback if image fails
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MINAS TÁXI", margin + 28, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Rotas Otimizadas", margin + 28, 20);

  const dateStr = opts.scheduledDate || new Date().toLocaleDateString("pt-BR");
  doc.text(dateStr, pageW - margin, 13, { align: "right" });
  doc.text(`${routes.length} veículo(s)`, pageW - margin, 20, { align: "right" });

  y = 36;

  // Trip info box
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Empresa:", margin + 3, y + 6);
  doc.text("Destino:", margin + 3, y + 12);
  doc.text("Solicitante:", margin + contentW / 2, y + 6);
  doc.text("Pagamento:", margin + contentW / 2, y + 12);
  doc.setFont("helvetica", "normal");
  doc.text(opts.companyName || "—", margin + 22, y + 6);
  doc.text(opts.destination || "—", margin + 20, y + 12, { maxWidth: contentW / 2 - 25 });
  doc.text(`${opts.solicitante || "—"} ${opts.phone ? `(${opts.phone})` : ""}`, margin + contentW / 2 + 22, y + 6);
  doc.text(paymentLabels[opts.payment || ""] || opts.payment || "—", margin + contentW / 2 + 24, y + 12);

  y += 28;

  // Routes
  routes.forEach((route, rIdx) => {
    const routeHeight = 28 + route.passengers.length * 12 + 16;
    checkNewPage(routeHeight);

    // Route header
    doc.setFillColor(...gold);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`CARRO ${route.vehicleNumber} — ${route.routeName}`, margin + 4, y + 7);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${route.passengers.length} passageiro(s)`, pageW - margin - 4, y + 7, { align: "right" });
    y += 14;

    // Times
    doc.setTextColor(...gray);
    doc.setFontSize(7.5);
    doc.text(
      `Partida: ${route.departureTime}h  →  Chegada: ${route.arrivalTime}h  (${route.estimatedTravelTime})`,
      margin + 4,
      y
    );
    y += 6;

    // Passengers table header
    doc.setFillColor(...lightBg);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("#", margin + 3, y + 5);
    doc.text("Passageiro", margin + 10, y + 5);
    doc.text("Endereço", margin + 55, y + 5);
    doc.text("Horário", pageW - margin - 4, y + 5, { align: "right" });
    y += 9;

    // Passengers
    route.passengers.forEach((p, i) => {
      checkNewPage(12);
      doc.setTextColor(...dark);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, margin + 3, y + 4);
      doc.setFont("helvetica", "normal");
      doc.text(p.name, margin + 10, y + 4, { maxWidth: 42 });
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.text(p.address, margin + 55, y + 4, { maxWidth: contentW - 75 });
      doc.text(route.pickupTimes[i] || "", pageW - margin - 4, y + 4, { align: "right" });

      if (i < route.passengers.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.line(margin + 10, y + 7, pageW - margin, y + 7);
      }
      y += 10;
    });

    // Destination row
    checkNewPage(12);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 2, contentW, 9, "F");
    doc.setTextColor(...gold);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("▶ DESTINO", margin + 3, y + 4);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.text(`${opts.companyName || "Destino"} — ${opts.destination || ""}`, margin + 28, y + 4, {
      maxWidth: contentW - 55,
    });
    doc.text(route.arrivalTime + "h", pageW - margin - 4, y + 4, { align: "right" });
    y += 14;

    // Divider between routes
    if (rIdx < routes.length - 1) {
      checkNewPage(6);
      doc.setDrawColor(210, 210, 210);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin, y, pageW - margin, y);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.text(
      `Minas Taxi — Gerado em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Página ${i}/${pageCount}`,
      pageW - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }

  const fileName = `rotas-${opts.scheduledDate || new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
