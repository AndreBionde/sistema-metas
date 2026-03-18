import { MONTH_NAMES } from "../constants/defaultData";
import {
  calculateCompletionRate,
  calculateFilledMonthsCount,
  calculateGoalProgress,
  calculateGoalTotal,
  calculateGrandTotal,
  calculateMonthlyAverage,
  calculatePlannedAnnualTotal,
} from "./calculations";
import { formatCurrency, formatPercent } from "./formatters";

const goalStatusLabels = {
  active: "Ativa",
  paused: "Pausada",
  completed: "Conclu\u00EDda",
};

const buildYearRows = (yearKey, yearPlan) => {
  const goalsSheet = yearPlan.goals.map((goal) => ({
    ano: yearKey,
    nome: goal.name,
    categoria: goal.category,
    status: goal.status,
    meta_valor: goal.targetAmount,
    aporte_planejado_mensal: goal.plannedMonthlyAmount,
  }));

  const monthlySheet = yearPlan.monthlyData.map((month, index) => {
    const row = {
      ano: yearKey,
      mes: MONTH_NAMES[index],
      observacao: month.observation,
    };

    yearPlan.goals.forEach((goal) => {
      row[goal.name] = month.values?.[goal.id] || 0;
    });

    return row;
  });

  return { goalsSheet, monthlySheet };
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

export const exportWorkbookFile = async (appState, fileName) => {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  Object.entries(appState.years).forEach(([yearKey, yearPlan]) => {
    const { goalsSheet, monthlySheet } = buildYearRows(yearKey, yearPlan);
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(goalsSheet),
      `${yearKey}-metas`
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(monthlySheet),
      `${yearKey}-mensal`
    );
  });

  XLSX.writeFile(workbook, fileName);
};

export const exportPdfFile = async (appState, fileName) => {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default || autoTableModule.autoTable;
  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const createdAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  document.setFont("helvetica", "bold");
  document.setFontSize(18);
  document.text("Relat\u00F3rio detalhado de metas financeiras", 14, 18);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text(`Gerado em ${createdAt}`, 14, 24);

  let currentY = 30;

  Object.entries(appState.years).forEach(([yearKey, yearPlan], index) => {
    if (index > 0) {
      document.addPage();
      currentY = 18;
    }

    const yearTotal = calculateGrandTotal(yearPlan.monthlyData);
    const yearAverage = calculateMonthlyAverage(yearPlan.monthlyData);
    const completionRate = calculateCompletionRate(
      yearPlan.goals,
      yearPlan.monthlyData
    );
    const filledMonths = calculateFilledMonthsCount(yearPlan.monthlyData);
    const plannedAnnual = calculatePlannedAnnualTotal(yearPlan.goals);

    document.setFont("helvetica", "bold");
    document.setFontSize(15);
    document.text(`Ano ${yearKey}`, 14, currentY);
    currentY += 6;

    document.setFont("helvetica", "normal");
    document.setFontSize(10);
    document.text(`Total acumulado: ${formatCurrency(yearTotal)}`, 14, currentY);
    document.text(`M\u00E9dia mensal: ${formatCurrency(yearAverage)}`, 78, currentY);
    document.text(`Meses preenchidos: ${filledMonths}`, 142, currentY);
    currentY += 5;
    document.text(
      `Planejado anual: ${formatCurrency(plannedAnnual)}`,
      14,
      currentY
    );
    document.text(
      `Conclus\u00E3o das metas: ${formatPercent(completionRate)}`,
      78,
      currentY
    );
    currentY += 6;

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
        cellPadding: 2.2,
      },
      headStyles: {
        fillColor: [18, 43, 59],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 14, right: 14 },
    });

    autoTable(document, {
      startY: document.lastAutoTable.finalY + 8,
      head: [["M\u00EAs", "Resumo de aportes", "Total do m\u00EAs", "Observa\u00E7\u00E3o"]],
      body: yearPlan.monthlyData.map((month, monthIndex) => [
        MONTH_NAMES[monthIndex],
        buildGoalBreakdown(yearPlan.goals, month.values) || "Sem lan\u00E7amentos",
        formatCurrency(
          Object.values(month.values || {}).reduce(
            (sum, value) => sum + Number(value || 0),
            0
          )
        ),
        month.observation?.trim() || "-",
      ]),
      theme: "striped",
      styles: {
        fontSize: 8.2,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "top",
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 72 },
        2: { cellWidth: 28 },
        3: { cellWidth: 56 },
      },
      headStyles: {
        fillColor: [32, 67, 88],
      },
      alternateRowStyles: {
        fillColor: [248, 249, 251],
      },
      margin: { left: 14, right: 14, bottom: 14 },
    });
  });

  document.save(fileName);
};
