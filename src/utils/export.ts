"use client";

function buildCsv(rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return "";
  const keys = Array.from(
    rows.reduce<Set<string>>((acc, row) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>()),
  );
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((k) => {
          const cell = row[k];
          const str =
            cell === null || cell === undefined ? "" : String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(","),
    ),
  ].join("\n");
  return csv;
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;

  // Reuse shared CSV generation
  const csv = buildCsv(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyCsvToClipboard(rows: Record<string, unknown>[]) {
  const csv = buildCsv(rows);
  if (!csv) return;
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    throw new Error("Clipboard API not available");
  }
  return navigator.clipboard.writeText(csv);
}