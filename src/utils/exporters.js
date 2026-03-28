import { MONTH_NAMES } from "../constants/defaultData";
import {
  calculateCompletionRate,
  calculateCyclePlannedAnnualTotal,
  calculateFilledMonthsCount,
  calculateGoalProgress,
  calculateGoalTotal,
  calculateGrandTotal,
  calculateMonthlyAverage,
} from "./calculations";
import { formatCurrency, formatPercent } from "./formatters";

const goalStatusLabels = {
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
};

const calculateMonthRecordedTotal = (month) =>
  Object.values(month.values || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

const buildYearRows = (yearKey, yearPlan) => {
  const goalsSheet = yearPlan.goals.map((goal) => ({
    Ano: yearKey,
    Meta: goal.name,
    Categoria: goal.category,
    Status: goalStatusLabels[goal.status] || goal.status,
    "Meta alvo": goal.targetAmount,
    "Aporte planejado mensal": goal.plannedMonthlyAmount,
    Acumulado: calculateGoalTotal(yearPlan.monthlyData, goal.id),
    Progresso: formatPercent(
      calculateGoalProgress(yearPlan.goals, yearPlan.monthlyData, goal.id)
    ),
  }));

  const monthlySheet = yearPlan.monthlyData.map((month, index) => {
    const row = {
      Ano: yearKey,
      Mês: MONTH_NAMES[index],
      "Total do mês": calculateMonthRecordedTotal(month),
      Observação: month.observation,
    };

    yearPlan.goals.forEach((goal) => {
      row[goal.name] = month.values?.[goal.id] || 0;
    });

    return row;
  });

  const summarySheet = [
    { Indicador: "Ano", Valor: yearKey },
    { Indicador: "Total acumulado", Valor: calculateGrandTotal(yearPlan.monthlyData) },
    { Indicador: "Média mensal", Valor: calculateMonthlyAverage(yearPlan.monthlyData) },
    { Indicador: "Planejado anual", Valor: calculateCyclePlannedAnnualTotal(yearPlan.goals) },
    {
      Indicador: "Conclusão das metas",
      Valor: formatPercent(
        calculateCompletionRate(yearPlan.goals, yearPlan.monthlyData)
      ),
    },
    {
      Indicador: "Meses preenchidos",
      Valor: calculateFilledMonthsCount(yearPlan.monthlyData),
    },
  ];

  return { summarySheet, goalsSheet, monthlySheet };
};

const setWorksheetPresentation = (worksheet, columnWidths = []) => {
  if (!worksheet["!ref"]) {
    return worksheet;
  }

  worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));
  worksheet["!rows"] = [{ hpt: 22 }];
  worksheet["!autofilter"] = {
    ref: worksheet["!ref"].replace(/:[A-Z]+[0-9]+$/, (match) =>
      match.replace(/[0-9]+$/, "1")
    ),
  };

  return worksheet;
};

const buildGoalBreakdown = (goals, monthValues) =>
  goals
    .map((goal) => ({
      name: goal.name,
      value: Number(monthValues?.[goal.id] || 0),
    }))
    .filter((item) => item.value > 0)
    .map((item) => `${item.name}: ${formatCurrency(item.value)}`)
    .join("\n");

export const downloadTextFile = (fileName, content, mimeType) => {
  const fileBlob = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};

export const downloadBlobFile = (fileName, fileBlob) => {
  const downloadUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};

export const exportCsv = (appState, selectedYear) => {
  const yearPlan = appState.years[selectedYear];
  const { monthlySheet } = buildYearRows(selectedYear, yearPlan);
  const headers = Object.keys(monthlySheet[0] || {});
  const csv = [
    headers.join(","),
    ...monthlySheet.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  return csv;
};

export const exportWorkbookFile = async (appState, selectedYear, fileName) => {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const yearPlan = appState.years[selectedYear];
  const { summarySheet, goalsSheet, monthlySheet } = buildYearRows(
    selectedYear,
    yearPlan
  );

  const summaryWorksheet = setWorksheetPresentation(
    XLSX.utils.json_to_sheet(summarySheet),
    [28, 18]
  );
  const goalsWorksheet = setWorksheetPresentation(
    XLSX.utils.json_to_sheet(goalsSheet),
    [10, 22, 16, 14, 16, 24, 14, 14]
  );
  const monthlyWorksheet = setWorksheetPresentation(
    XLSX.utils.json_to_sheet(monthlySheet),
    [10, 12, 16, 28, ...yearPlan.goals.map(() => 16)]
  );

  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, `Resumo ${selectedYear}`);
  XLSX.utils.book_append_sheet(workbook, goalsWorksheet, `Metas ${selectedYear}`);
  XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, `Mensal ${selectedYear}`);

  XLSX.writeFile(workbook, fileName);
};

export const exportPdfFile = async (appState, selectedYear, fileName) => {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default || autoTableModule.autoTable;
  const yearPlan = appState.years[selectedYear];
  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const createdAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const yearTotal = calculateGrandTotal(yearPlan.monthlyData);
  const yearAverage = calculateMonthlyAverage(yearPlan.monthlyData);
  const completionRate = calculateCompletionRate(yearPlan.goals, yearPlan.monthlyData);
  const filledMonths = calculateFilledMonthsCount(yearPlan.monthlyData);
  const plannedAnnual = calculateCyclePlannedAnnualTotal(yearPlan.goals);

  document.setFillColor(18, 43, 59);
  document.roundedRect(14, 14, 182, 24, 4, 4, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(18);
  document.text(`PlanoMeta • Relatório ${selectedYear}`, 20, 24);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text(`Gerado em ${createdAt}`, 20, 31);

  const summaryCards = [
    ["Total acumulado", formatCurrency(yearTotal)],
    ["Planejado anual", formatCurrency(plannedAnnual)],
    ["Média mensal", formatCurrency(yearAverage)],
    ["Conclusão das metas", formatPercent(completionRate)],
    ["Meses preenchidos", String(filledMonths)],
    ["Metas no ciclo", String(yearPlan.goals.length)],
  ];

  document.setTextColor(23, 31, 39);
  summaryCards.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const cardX = 14 + column * 91;
    const cardY = 46 + row * 19;

    document.setFillColor(247, 244, 239);
    document.roundedRect(cardX, cardY, 86, 15, 3, 3, "F");
    document.setFont("helvetica", "normal");
    document.setFontSize(8.5);
    document.setTextColor(104, 116, 129);
    document.text(label, cardX + 4, cardY + 5.5);
    document.setFont("helvetica", "bold");
    document.setFontSize(11);
    document.setTextColor(23, 31, 39);
    document.text(value, cardX + 4, cardY + 11.2);
  });

  let currentY = 108;

  document.setFont("helvetica", "bold");
  document.setFontSize(13);
  document.text("Metas do ano", 14, currentY);
  currentY += 4;

  autoTable(document, {
    startY: currentY,
    head: [
      [
        "Meta",
        "Categoria",
        "Status",
        "Meta alvo",
        "Planejado mensal",
        "Acumulado",
        "Progresso",
      ],
    ],
    body: yearPlan.goals.map((goal) => [
      goal.name,
      goal.category,
      goalStatusLabels[goal.status] || goal.status,
      formatCurrency(goal.targetAmount),
      formatCurrency(goal.plannedMonthlyAmount),
      formatCurrency(calculateGoalTotal(yearPlan.monthlyData, goal.id)),
      formatPercent(
        calculateGoalProgress(yearPlan.goals, yearPlan.monthlyData, goal.id)
      ),
    ]),
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 2.4,
      textColor: [23, 31, 39],
    },
    headStyles: {
      fillColor: [18, 43, 59],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 245, 240],
    },
    margin: { left: 14, right: 14 },
  });

  document.setFont("helvetica", "bold");
  document.setFontSize(13);
  document.setTextColor(23, 31, 39);
  document.text("Movimento mensal", 14, document.lastAutoTable.finalY + 10);

  autoTable(document, {
    startY: document.lastAutoTable.finalY + 14,
    head: [["Mês", "Resumo de aportes", "Total do mês", "Observação"]],
    body: yearPlan.monthlyData.map((month, monthIndex) => [
      MONTH_NAMES[monthIndex],
      buildGoalBreakdown(yearPlan.goals, month.values) || "Sem lançamentos",
      formatCurrency(calculateMonthRecordedTotal(month)),
      month.observation?.trim() || "-",
    ]),
    theme: "striped",
    styles: {
      fontSize: 8.2,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "top",
      textColor: [23, 31, 39],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 72 },
      2: { cellWidth: 28 },
      3: { cellWidth: 56 },
    },
    headStyles: {
      fillColor: [44, 83, 100],
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [250, 248, 244],
    },
    margin: { left: 14, right: 14, bottom: 14 },
  });

  document.save(fileName);
};

export const exportDocxSummaryFile = async (appState, currentYear, fileName) => {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");

  const yearPlan = appState.years[currentYear];
  const total = calculateGrandTotal(yearPlan.monthlyData);
  const average = calculateMonthlyAverage(yearPlan.monthlyData);
  const completion = calculateCompletionRate(yearPlan.goals, yearPlan.monthlyData);
  const planned = calculateCyclePlannedAnnualTotal(yearPlan.goals);

  const headerCell = (text) =>
    new TableCell({
      shading: { fill: "123547" },
      borders: {
        top: { style: BorderStyle.SINGLE, color: "123547", size: 1 },
        bottom: { style: BorderStyle.SINGLE, color: "123547", size: 1 },
        left: { style: BorderStyle.SINGLE, color: "123547", size: 1 },
        right: { style: BorderStyle.SINGLE, color: "123547", size: 1 },
      },
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
        }),
      ],
    });

  const bodyCell = (text) =>
    new TableCell({
      children: [new Paragraph({ text: String(text ?? "-") })],
    });

  const metricsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [5200, 3800],
    rows: [
      new TableRow({
        children: [headerCell("Indicador"), headerCell("Valor")],
      }),
      ...[
        ["Total acumulado", formatCurrency(total)],
        ["Planejado anual", formatCurrency(planned)],
        ["Média mensal", formatCurrency(average)],
        ["Conclusão das metas", formatPercent(completion)],
        ["Meses preenchidos", String(calculateFilledMonthsCount(yearPlan.monthlyData))],
      ].map(
        ([label, value]) =>
          new TableRow({
            children: [bodyCell(label), bodyCell(value)],
          })
      ),
    ],
  });

  const goalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [2400, 1800, 1600, 1900, 1900],
    rows: [
      new TableRow({
        children: [
          headerCell("Meta"),
          headerCell("Categoria"),
          headerCell("Status"),
          headerCell("Meta alvo"),
          headerCell("Planejado mensal"),
        ],
      }),
      ...yearPlan.goals.map(
        (goal) =>
          new TableRow({
            children: [
              bodyCell(goal.name),
              bodyCell(goal.category),
              bodyCell(goalStatusLabels[goal.status] || goal.status),
              bodyCell(formatCurrency(goal.targetAmount)),
              bodyCell(formatCurrency(goal.plannedMonthlyAmount)),
            ],
          })
      ),
    ],
  });

  const monthsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [1700, 1800, 5500],
    rows: [
      new TableRow({
        children: [headerCell("Mês"), headerCell("Total"), headerCell("Observação")],
      }),
      ...yearPlan.monthlyData.map(
        (month, index) =>
          new TableRow({
            children: [
              bodyCell(MONTH_NAMES[index]),
              bodyCell(formatCurrency(calculateMonthRecordedTotal(month))),
              bodyCell(month.observation || "-"),
            ],
          })
      ),
    ],
  });

  // Tabelas com larguras fixas ficam bem mais estáveis na abertura pelo
  // Google Docs, que era o caso mais sensível entre os exportadores DOCX.
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `PlanoMeta - Resumo ${currentYear}`,
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Resumo executivo exportado do ano atualmente selecionado.",
            spacing: { after: 240 },
          }),
          metricsTable,
          new Paragraph({
            text: "Metas",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 260, after: 140 },
          }),
          goalsTable,
          new Paragraph({
            text: "Meses",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 260, after: 140 },
          }),
          monthsTable,
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 220 },
            children: [
              new TextRun({
                text: `Gerado em ${new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date())}`,
                italics: true,
                color: "5C6773",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const fileBlob = await Packer.toBlob(document);
  downloadBlobFile(fileName, fileBlob);
};
