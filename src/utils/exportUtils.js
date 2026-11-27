const textEncoder = new TextEncoder();

const escapeCsvValue = value => {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
};

const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Export tabular data to a UTF-8 CSV file (with BOM for Excel compatibility).
 */
export const exportToCsv = ({ columns, rows, filename = "export.csv" }) => {
  const headerLine = columns.map(col => escapeCsvValue(col.label)).join(",");
  const dataLines = rows.map(row => (
    columns.map(col => escapeCsvValue(typeof col.getValue === "function" ? col.getValue(row) : row[col.key])).join(",")
  ));
  const csvContent = [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, filename);
};

// --- Minimal spec-compliant OOXML (.xlsx) generator (uncompressed STORE ZIP) ---

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = bytes => {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const createZipBlob = entries => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach(({ name, content }) => {
    const nameBytes = textEncoder.encode(name);
    const dataBytes = typeof content === "string" ? textEncoder.encode(content) : content;
    const checksum = crc32(dataBytes);

    const localHeader = new ArrayBuffer(30);
    const lView = new DataView(localHeader);
    lView.setUint32(0, 0x04034B50, true);
    lView.setUint16(4, 20, true);
    lView.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lView.setUint16(8, 0, true); // STORE (no compression)
    lView.setUint16(10, 0, true);
    lView.setUint16(12, 0, true);
    lView.setUint32(14, checksum, true);
    lView.setUint32(18, dataBytes.length, true);
    lView.setUint32(22, dataBytes.length, true);
    lView.setUint16(26, nameBytes.length, true);
    lView.setUint16(28, 0, true);

    localParts.push(new Uint8Array(localHeader), nameBytes, dataBytes);

    const centralHeader = new ArrayBuffer(46);
    const cView = new DataView(centralHeader);
    cView.setUint32(0, 0x02014B50, true);
    cView.setUint16(4, 20, true);
    cView.setUint16(6, 20, true);
    cView.setUint16(8, 0x0800, true);
    cView.setUint16(10, 0, true);
    cView.setUint16(12, 0, true);
    cView.setUint16(14, 0, true);
    cView.setUint32(16, checksum, true);
    cView.setUint32(20, dataBytes.length, true);
    cView.setUint32(24, dataBytes.length, true);
    cView.setUint16(28, nameBytes.length, true);
    cView.setUint16(30, 0, true);
    cView.setUint16(32, 0, true);
    cView.setUint16(34, 0, true);
    cView.setUint16(36, 0, true);
    cView.setUint32(38, 0, true);
    cView.setUint32(42, offset, true);

    centralParts.push(new Uint8Array(centralHeader), nameBytes);
    offset += 30 + nameBytes.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const eocd = new ArrayBuffer(22);
  const eView = new DataView(eocd);
  eView.setUint32(0, 0x06054B50, true);
  eView.setUint16(4, 0, true);
  eView.setUint16(6, 0, true);
  eView.setUint16(8, entries.length, true);
  eView.setUint16(10, entries.length, true);
  eView.setUint32(12, centralSize, true);
  eView.setUint32(16, offset, true);
  eView.setUint16(20, 0, true);

  return new Blob(
    [...localParts, ...centralParts, new Uint8Array(eocd)],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );
};

const escapeXml = value => (
  String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
);

const toColumnLetter = index => {
  let n = index;
  let result = "";
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
};

/**
 * Export tabular data to an Excel (.xlsx) workbook.
 */
export const exportToExcel = ({ columns, rows, filename = "export.xlsx", sheetName = "Orders" }) => {
  const safeSheetName = escapeXml(String(sheetName).slice(0, 31) || "Sheet1");
  const colWidths = columns.map(col => Math.max(12, String(col.label || "").length + 4));

  const matrix = [
    columns.map(col => String(col.label ?? "")),
    ...rows.map(row => columns.map((col, colIdx) => {
      const val = String((typeof col.getValue === "function" ? col.getValue(row) : row[col.key]) ?? "");
      colWidths[colIdx] = Math.min(50, Math.max(colWidths[colIdx], val.length + 3));
      return val;
    }))
  ];

  const colsXml = colWidths
    .map((w, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`)
    .join("");

  const rowsXml = matrix
    .map((rowVals, rowIdx) => {
      const rowNum = rowIdx + 1;
      const styleAttr = rowIdx === 0 ? ' s="1"' : "";
      const cellsXml = rowVals
        .map((val, colIdx) => (
          `<c r="${toColumnLetter(colIdx)}${rowNum}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXml(val)}</t></is></c>`
        ))
        .join("");
      return `<row r="${rowNum}">${cellsXml}</row>`;
    })
    .join("");

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<cols>${colsXml}</cols><sheetData>${rowsXml}</sheetData></worksheet>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
    `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
    `</styleSheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  const blob = createZipBlob([
    { name: "[Content_Types].xml", content: contentTypesXml },
    { name: "_rels/.rels", content: rootRelsXml },
    { name: "xl/workbook.xml", content: workbookXml },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRelsXml },
    { name: "xl/styles.xml", content: stylesXml },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml }
  ]);

  triggerBlobDownload(blob, filename);
};
