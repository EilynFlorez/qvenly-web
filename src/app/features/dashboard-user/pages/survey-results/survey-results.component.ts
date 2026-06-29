import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnChanges {

  @Input() eventId!: number;
  @Input() surveyId!: number;
  @Output() onBack = new EventEmitter<void>();

  results: any = null;
  loading = false;
  error = false;
  roleFilter = '';

  availableRoles = [
    { value: 'PARTICIPANT', label: 'Participantes' },
    { value: 'ATTENDEE',    label: 'Asistentes' },
    { value: 'JUDGE',       label: 'Jurados' },
    { value: 'STAFF',       label: 'Personal de apoyo' }
  ];

  constructor(private http: HttpClient) {}

  ngOnChanges(): void {
    if (this.eventId && this.surveyId) {
      this.loadResults();
    }
  }

  loadResults(): void {
    this.loading = true;
    this.error = false;
    const params = this.roleFilter ? `?roleFilter=${this.roleFilter}` : '';
    this.http.get<any>(
      `${environment.apiUrl}/api/events/${this.eventId}/surveys/${this.surveyId}/results${params}`,
      { withCredentials: true }
    ).subscribe({
      next: res => { this.results = res.data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  onRoleFilterChange(): void {
    this.loadResults();
  }

  goBack(): void {
    this.onBack.emit();
  }

  getQuestionTypeLabel(type: string): string {
    return {
      SINGLE_CHOICE: 'Opción única',
      MULTIPLE_CHOICE: 'Múltiple opción',
      OPEN_TEXT: 'Texto abierto',
      RATING: 'Calificación'
    }[type] || type;
  }

  getBarWidth(count: number, total: number): string {
    if (!total) return '0%';
    return Math.round((count / total) * 100) + '%';
  }

  getBarPercent(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getRoleLabel(role: string): string {
    return {
      PARTICIPANT: 'Participantes', ATTENDEE: 'Asistentes',
      JUDGE: 'Jurados', STAFF: 'Personal'
    }[role] || role;
  }

  get canFilter(): boolean {
  return (this.results?.targetRoles?.length || 0) > 1;
}

getRatingCount(distribution: Record<number, number>, star: number): number {
  return distribution?.[star] ?? 0;
}

getRatingBarWidth(distribution: Record<number, number>, star: number, total: number): string {
  if (!total || !distribution) return '0%';
  return Math.round((distribution[star] / total) * 100) + '%';
}


async exportExcel(): Promise<void> {
  if (!this.results) return;

  const ExcelJS = await import('exceljs');
  const { saveAs } = await import('file-saver');
  const wb = new ExcelJS.Workbook();

  // ── Colores ──────────────────────────────────────────────────
  const TEAL = '0F766E';
  const TEAL_LIGHT = 'F0FDFA';
  const GRAY = '6B7280';
  const WHITE = 'FFFFFF';

  // ══════════════════════════════════════════════════════════════
  // HOJA 1: RESUMEN
  // ══════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('Resumen');
  ws1.columns = [
    { width: 30 },
    { width: 20 }
  ];

  // Título
  ws1.mergeCells('A1:B1');
  const titleRow = ws1.getCell('A1');
  titleRow.value = 'Resultados de encuesta';
  titleRow.font = { bold: true, size: 14, color: { argb: WHITE } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(1).height = 30;

  // Nombre encuesta
  ws1.mergeCells('A2:B2');
  const nameCell = ws1.getCell('A2');
  nameCell.value = this.results.surveyTitle;
  nameCell.font = { bold: true, size: 12 };
  nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_LIGHT } };
  nameCell.alignment = { horizontal: 'center' };
  ws1.getRow(2).height = 22;

  ws1.addRow([]);

  // Total respuestas
  const totalRow = ws1.addRow(['Total de respuestas', this.results.totalResponses]);
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(2).alignment = { horizontal: 'center' };

  ws1.addRow([]);

  // Header roles
  const rolesHeader = ws1.addRow(['Respuestas por rol', 'Cantidad']);
  rolesHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
    cell.alignment = { horizontal: 'center' };
  });

  (this.results.targetRoles || []).forEach((role: string) => {
  const count = this.results.responsesByRole?.[role] ?? 0;
  const row = ws1.addRow([this.getRoleLabel(role), count]);
  row.getCell(2).alignment = { horizontal: 'center' };
});

  // ══════════════════════════════════════════════════════════════
  // HOJA 2: RESULTADOS POR PREGUNTA
  // ══════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet('Resultados');
  ws2.columns = [
    { width: 6 },
    { width: 40 },
    { width: 20 },
    { width: 15 },
    { width: 40 }
  ];

  // Header
  const header = ws2.addRow(['#', 'Pregunta', 'Tipo', 'Respuestas', 'Detalle']);
  header.eachCell(cell => {
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: WHITE } }
    };
  });
  ws2.getRow(1).height = 24;

  (this.results.questionResults || []).forEach((q: any, i: number) => {
    // Fila de pregunta
    const qRow = ws2.addRow([
      i + 1,
      q.questionText,
      this.getQuestionTypeLabel(q.questionType),
      q.totalAnswers ?? q.responseCount ?? 0,
      ''
    ]);
    qRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_LIGHT } };
      cell.font = { bold: true };
    });
    qRow.getCell(1).alignment = { horizontal: 'center' };

    if (q.questionType === 'OPEN_TEXT') {
      (q.openAnswers || []).forEach((ans: string) => {
        const r = ws2.addRow(['', '', '', '', ans]);
        r.getCell(5).alignment = { wrapText: true };
      });
      if (!q.openAnswers?.length) {
        ws2.addRow(['', '', '', '', 'Sin respuestas aún']);
      }

    } else if (q.questionType === 'RATING') {
      ws2.addRow(['', '', '', '', `Promedio: ${(q.averageRating || 0).toFixed(2)} / 5`]);
      [5, 4, 3, 2, 1].forEach(star => {
        ws2.addRow(['', '', '', '',
          `${star} ⭐: ${q.ratingDistribution?.[star] ?? 0} respuesta(s)`]);
      });

    } else {
      (q.optionResults || []).forEach((opt: any) => {
        ws2.addRow(['', '', '', '',
          `${opt.optionText}: ${opt.count} (${opt.percentage.toFixed(1)}%)`]);
      });
    }

    ws2.addRow([]);
  });

  // Generar y descargar
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }), `resultados_${this.results.surveyTitle || 'encuesta'}.xlsx`);
}




async exportPdf(): Promise<void> {
  if (!this.results) return;

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const TEAL  = [15, 118, 110] as [number, number, number];
  const TEAL_LIGHT = [240, 253, 250] as [number, number, number];
  const GRAY  = [107, 114, 128] as [number, number, number];
  const BLACK = [30, 30, 30] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Encabezado ────────────────────────────────────────────────
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados de Encuesta', margin, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(this.results.surveyTitle || '', margin, 21);
  y = 36;

  // ── Resumen ───────────────────────────────────────────────────
  doc.setFillColor(...TEAL_LIGHT);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total de respuestas', margin + 6, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(...TEAL);
  doc.text(String(this.results.totalResponses || 0), margin + 6, y + 18);
  y += 30;

  // Respuestas por rol
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('Respuestas por rol:', margin, y);
  y += 6;
  (this.results.targetRoles || []).forEach((role: string) => {
  const count = this.results.responsesByRole?.[role] ?? 0;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`${this.getRoleLabel(role)}: ${count}`, margin + 4, y);
  y += 5;
});
  y += 6;

  // ── Línea separadora ──────────────────────────────────────────
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Preguntas ─────────────────────────────────────────────────
  (this.results.questionResults || []).forEach((q: any, i: number) => {
    checkPage(20);

    // Número + texto pregunta
    doc.setFillColor(...TEAL);
    doc.circle(margin + 4, y + 3, 4, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1), margin + 4, y + 4, { align: 'center' });

    doc.setTextColor(...BLACK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(q.questionText, contentW - 14) as string[];
    doc.text(lines, margin + 10, y + 4);
    y += Math.max(10, lines.length * 5) + 2;

    // Tipo
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...GRAY);
    doc.text(this.getQuestionTypeLabel(q.questionType), margin + 10, y);
    y += 6;

    // ── SINGLE / MULTIPLE CHOICE ──────────────────────────────
    if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE') {
      (q.optionResults || []).forEach((opt: any) => {
        checkPage(10);
        const pct = opt.percentage ?? 0;
        const barW = (contentW - 14) * (pct / 100);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...BLACK);
        const optLines = doc.splitTextToSize(opt.optionText, contentW - 50) as string[];
        doc.text(optLines, margin + 10, y);

        // Barra
        doc.setFillColor(229, 231, 235);
        doc.roundedRect(margin + 10, y + 2, contentW - 14, 4, 1, 1, 'F');
        if (barW > 0) {
          doc.setFillColor(...TEAL);
          doc.roundedRect(margin + 10, y + 2, barW, 4, 1, 1, 'F');
        }

        // Conteo
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(`${opt.count} (${pct.toFixed(1)}%)`, pageW - margin - 2, y, { align: 'right' });
        y += optLines.length * 4 + 6;
      });

    // ── RATING ────────────────────────────────────────────────
    } else if (q.questionType === 'RATING') {
      checkPage(14);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text((q.averageRating || 0).toFixed(1), margin + 10, y + 8);
      doc.setFontSize(10);
      doc.setTextColor(...GRAY);
      doc.text('/ 5', margin + 26, y + 8);
      doc.setFontSize(8);
      doc.text(`(${q.responseCount || 0} respuestas)`, margin + 36, y + 8);
      y += 14;

      [5, 4, 3, 2, 1].forEach(star => {
        checkPage(7);
        const cnt = q.ratingDistribution?.[star] ?? 0;
        const total = q.responseCount || 1;
        const pct = cnt / total;
        const barW = (contentW - 30) * pct;

        doc.setFontSize(8);
        doc.setTextColor(...BLACK);
        doc.text(`${star}★`, margin + 10, y + 3);

        doc.setFillColor(229, 231, 235);
        doc.roundedRect(margin + 18, y, contentW - 30, 4, 1, 1, 'F');
        if (barW > 0) {
          doc.setFillColor(...TEAL);
          doc.roundedRect(margin + 18, y, barW, 4, 1, 1, 'F');
        }

        doc.setTextColor(...GRAY);
        doc.text(String(cnt), pageW - margin - 2, y + 3, { align: 'right' });
        y += 6;
      });

    // ── OPEN TEXT ─────────────────────────────────────────────
    } else if (q.questionType === 'OPEN_TEXT') {
      if (!q.openAnswers?.length) {
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'italic');
        doc.text('Sin respuestas aún.', margin + 10, y);
        y += 6;
      } else {
        (q.openAnswers || []).forEach((ans: string) => {
          checkPage(12);
          doc.setFillColor(249, 250, 251);
          const ansLines = doc.splitTextToSize(`"${ans}"`, contentW - 18) as string[];
          const boxH = ansLines.length * 5 + 4;
          doc.roundedRect(margin + 10, y - 2, contentW - 10, boxH, 2, 2, 'F');
          doc.setFontSize(9);
          doc.setTextColor(...BLACK);
          doc.setFont('helvetica', 'italic');
          doc.text(ansLines, margin + 13, y + 2);
          y += boxH + 3;
        });
      }
    }

    y += 6;
    // Línea entre preguntas
    checkPage(4);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  });

  // ── Pie de página ─────────────────────────────────────────────
  const totalPages = (doc as any).internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`Página ${p} de ${totalPages}`, pageW / 2, 290, { align: 'center' });
    doc.text('Qvenly — Resultados de encuesta', margin, 290);
  }

  doc.save(`resultados_${this.results.surveyTitle || 'encuesta'}.pdf`);
}

}