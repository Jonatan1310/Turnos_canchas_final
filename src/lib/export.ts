import { Booking, ComplexSettings } from "../types";
import { formatCurrency } from "./currency";

export function exportBookingsToCSV(
  bookings: Booking[],
  fileName = "reporte-reservas.csv",
) {
  const headers = [
    "ID",
    "Fecha",
    "Hora Inicio",
    "Hora Fin",
    "Cancha",
    "Cliente",
    "Teléfono",
    "WhatsApp",
    "Estado Reserva",
    "Precio Total",
    "Estado Pago",
    "Método Pago",
    "Notas",
    "Creado Por",
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.date,
    b.startTime,
    b.endTime,
    `"${b.courtId}"`,
    `"${b.customerName}"`,
    `"${b.customerPhone}"`,
    `"${b.customerWhatsApp}"`,
    b.status,
    b.totalPrice,
    b.payment.status,
    b.payment.method,
    `"${(b.notes || "").replace(/"/g, '""')}"`,
    `"${b.createdBy}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printBookingsReport(
  bookings: Booking[],
  title = "Reporte de Reservas",
  settings?: ComplexSettings,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rowsHtml = bookings
    .map(
      (b) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${b.date}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${b.startTime} - ${b.endTime}</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>${b.customerName}</strong><br><small>${b.customerPhone}</small></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${b.status}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(b.totalPrice, settings, 'admin')}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${b.payment.status} (${b.payment.method})</td>
    </tr>
  `,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; color: #333; }
          h1 { margin-bottom: 5px; }
          .sub { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #2563eb; color: white; padding: 10px; border: 1px solid #2563eb; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="sub">Generado el ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
