// Real table calculation and data reasoning engine for CSV / Excel files

export function analyzeTableQuery(query, pages) {
  const q = query.toLowerCase();
  
  // Find pages with structured tabular data or CSV sheets
  let tableRows = [];
  let headers = [];
  let sourcePage = 1;
  let sheetName = 'Sheet 1';

  for (const page of pages) {
    if (page.structuredData && page.structuredData.length > 1) {
      headers = page.structuredData[0].map(h => String(h || '').trim());
      tableRows = page.structuredData.slice(1);
      sourcePage = page.pageNumber;
      if (page.text.includes('Sheet:')) {
        const match = page.text.match(/Sheet:\s*([^\n]+)/);
        if (match) sheetName = match[1];
      }
      break;
    }
  }

  // If no structuredData matrix directly on page, parse from CSV text
  if (tableRows.length === 0) {
    for (const page of pages) {
      const lines = page.text.split('\n').map(l => l.trim()).filter(l => l.includes(',') || l.includes('\t'));
      if (lines.length > 2) {
        const sep = lines[0].includes(',') ? ',' : '\t';
        headers = lines[0].split(sep).map(h => h.trim().replace(/^["']|["']$/g, ''));
        tableRows = lines.slice(1).map(l => l.split(sep).map(c => c.trim().replace(/^["']|["']$/g, '')));
        sourcePage = page.pageNumber;
        break;
      }
    }
  }

  if (tableRows.length === 0 || headers.length === 0) {
    return null; // Not a table calculation request or no tables found
  }

  // Identify numeric columns
  const colStats = {};
  headers.forEach((h, colIdx) => {
    const values = [];
    const rawPairs = [];
    tableRows.forEach(row => {
      const label = row[0] || 'Row';
      const rawVal = row[colIdx];
      const cleaned = String(rawVal || '').replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        values.push(num);
        rawPairs.push({ label, value: num, raw: rawVal });
      }
    });

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const maxItem = rawPairs.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), rawPairs[0]);
      const minItem = rawPairs.reduce((prev, curr) => (curr.value < prev.value ? curr : prev), rawPairs[0]);
      colStats[h] = {
        colName: h,
        count: values.length,
        sum,
        avg: parseFloat(avg.toFixed(2)),
        max: maxItem,
        min: minItem,
        items: rawPairs
      };
    }
  });

  const numericColNames = Object.keys(colStats);
  if (numericColNames.length === 0) return null;

  // Match which column the user is querying
  let targetCol = numericColNames[0];
  for (const name of numericColNames) {
    if (q.includes(name.toLowerCase())) {
      targetCol = name;
      break;
    }
  }
  const stat = colStats[targetCol];

  // Detect calculation intent: average, highest/max, lowest/min, total/sum, top 5, compare
  if (q.includes('highest') || q.includes('maximum') || q.includes('max') || q.includes('best') || q.includes('peak')) {
    return {
      type: 'MAX',
      result: `${stat.max.label} with ${stat.max.value.toLocaleString()} (${stat.colName})`,
      calculation: `Max value inspected across ${stat.count} entries in column "${stat.colName}".`,
      data: stat.max,
      chartData: stat.items.slice(0, 8),
      source: { page: sourcePage, sheet: sheetName, column: stat.colName }
    };
  }

  if (q.includes('lowest') || q.includes('minimum') || q.includes('min') || q.includes('least')) {
    return {
      type: 'MIN',
      result: `${stat.min.label} with ${stat.min.value.toLocaleString()} (${stat.colName})`,
      calculation: `Min value inspected across ${stat.count} entries in column "${stat.colName}".`,
      data: stat.min,
      chartData: stat.items.slice(0, 8),
      source: { page: sourcePage, sheet: sheetName, column: stat.colName }
    };
  }

  if (q.includes('average') || q.includes('mean') || q.includes('avg')) {
    return {
      type: 'AVERAGE',
      result: `${stat.avg.toLocaleString()} (${stat.colName})`,
      calculation: `Sum (${stat.sum.toLocaleString()}) ÷ Count (${stat.count}) = ${stat.avg.toLocaleString()}`,
      data: { average: stat.avg, count: stat.count, sum: stat.sum },
      chartData: stat.items.slice(0, 8),
      source: { page: sourcePage, sheet: sheetName, column: stat.colName }
    };
  }

  if (q.includes('total') || q.includes('sum') || q.includes('overall') || q.includes('aggregate')) {
    return {
      type: 'SUM',
      result: `${stat.sum.toLocaleString()} (${stat.colName})`,
      calculation: `Sum of all ${stat.count} entries in column "${stat.colName}".`,
      data: { sum: stat.sum, count: stat.count },
      chartData: stat.items.slice(0, 8),
      source: { page: sourcePage, sheet: sheetName, column: stat.colName }
    };
  }

  if (q.includes('top') || q.includes('rank') || q.includes('highest')) {
    const sorted = [...stat.items].sort((a, b) => b.value - a.value).slice(0, 5);
    return {
      type: 'TOP_5',
      result: sorted.map((s, i) => `${i + 1}. ${s.label}: ${s.value.toLocaleString()}`).join('\n'),
      calculation: `Ranked entries sorted in descending order by ${stat.colName}.`,
      data: sorted,
      chartData: sorted,
      source: { page: sourcePage, sheet: sheetName, column: stat.colName }
    };
  }

  return null;
}
