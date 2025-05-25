import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";

// Apply the plugin so that doc.autoTable() works
applyPlugin(jsPDF);

// Extend jsPDF with autotable (for TypeScript)
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  trip?: {
    _id: string;
    name: string;
  };
  expense?: {
    _id: string;
    title: string;
  };
}

interface MonthlyStats {
  deposits: number;
  withdrawals: number;
  payments: number;
  total: number;
}

interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
}

export function generateWalletPDF(
  month: string,
  year: string,
  transactions: Transaction[],
  stats: MonthlyStats,
  categories: CategoryStats[]
) {
  // Create a new PDF document
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({
    title: `Wallet Report - ${month} ${year}`,
    subject: "Wallet Transactions Report",
    author: "WanderWave",
    creator: "WanderWave",
  });

  // Add logo or header
  doc.setFontSize(20);
  doc.setTextColor(82, 82, 91); // Slate-700
  doc.setFont("helvetica", "bold");
  doc.text("WanderWave", 105, 20, { align: "center" });

  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(82, 82, 91); // Slate-700
  doc.text(`Wallet Report: ${month} ${year}`, 105, 30, { align: "center" });

  // Add horizontal line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Add summary section
  doc.setFontSize(14);
  doc.setTextColor(82, 82, 91); // Slate-700
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 20, 45);

  // Add summary data
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500

  // Create a table for summary data
  const summaryData = [
    ["Total Deposits:", formatCurrency(stats.deposits)],
    ["Total Expenses:", formatCurrency(stats.payments)],
    ["Total Withdrawals:", formatCurrency(stats.withdrawals)],
    ["Net Change:", formatCurrency(stats.total)],
  ];

  // Set up the summary table
  doc.autoTable({
    startY: 50,
    head: [],
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: "bold", textColor: [100, 116, 139] },
      1: { cellWidth: 70, halign: "right", textColor: [0, 0, 0] },
    },
    margin: { left: 20 },
  });

  // Add categories section if there are categories
  if (categories.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 70;

    doc.setFontSize(14);
    doc.setTextColor(82, 82, 91); // Slate-700
    doc.setFont("helvetica", "bold");
    doc.text("Top Expense Categories", 20, finalY + 10);

    // Create category data
    const categoryData = categories
      .slice(0, 5)
      .map((cat) => [
        cat.category,
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`,
      ]);

    // Set up the category table
    doc.autoTable({
      startY: finalY + 15,
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
      theme: "striped",
      headStyles: {
        fillColor: [99, 102, 241], // Indigo-500
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: "right" },
        2: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 20 },
    });
  }

  // Add transactions section
  const finalY = (doc as any).lastAutoTable.finalY || 70;

  doc.setFontSize(14);
  doc.setTextColor(82, 82, 91); // Slate-700
  doc.setFont("helvetica", "bold");
  doc.text("Transaction History", 20, finalY + 10);

  // Create transaction data
  const transactionData = transactions.map((tx) => [
    formatDate(tx.createdAt),
    tx.description,
    tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
    tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
    tx.type === "deposit"
      ? formatCurrency(tx.amount)
      : `-${formatCurrency(tx.amount)}`,
  ]);

  // Set up the transaction table
  doc.autoTable({
    startY: finalY + 15,
    head: [["Date", "Description", "Type", "Status", "Amount"]],
    body: transactionData,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241], // Indigo-500
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: "right" },
    },
    didParseCell: (data: {
      column: { index: number };
      section: string;
      cell: { raw: string; styles: { textColor: number[] } };
    }) => {
      // Color the amount cell based on transaction type
      if (data.column.index === 4 && data.section === "body") {
        const amount = data.cell.raw as string;
        if (amount.startsWith("-")) {
          data.cell.styles.textColor = [239, 68, 68]; // Red-500
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-500
        }
      }

      // Color the status cell based on status
      if (data.column.index === 3 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "Completed") {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-500
        } else if (status === "Pending") {
          data.cell.styles.textColor = [245, 158, 11]; // Amber-500
        } else if (status === "Failed") {
          data.cell.styles.textColor = [239, 68, 68]; // Red-500
        }
      }
    },
    margin: { left: 20 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
    doc.text(
      "WanderWave - Wallet Report",
      105,
      doc.internal.pageSize.height - 5,
      { align: "center" }
    );
  }

  return doc;
}
