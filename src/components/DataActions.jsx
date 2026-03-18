import { FileSpreadsheet, FileText, RotateCcw } from "lucide-react";
import { formatDateTime } from "../utils/formatters";
import "../styles/DataActions.css";

const DataActions = ({
  onExportCsv,
  onExportXlsx,
  onExportPdf,
  onReset,
  notice,
  lastExportAt,
}) => {
  return (
    <section className="data-actions-container" aria-label="Ações de dados">
      <div className="data-actions-group">
        <button type="button" className="data-action-button" onClick={onExportCsv}>
          <FileSpreadsheet className="data-action-icon" aria-hidden="true" />
          Exportar CSV
        </button>
        <button type="button" className="data-action-button" onClick={onExportXlsx}>
          <FileSpreadsheet className="data-action-icon" aria-hidden="true" />
          Exportar XLSX
        </button>
        <button type="button" className="data-action-button" onClick={onExportPdf}>
          <FileText className="data-action-icon" aria-hidden="true" />
          Exportar PDF
        </button>
        <button
          type="button"
          className="data-action-button data-action-button-danger"
          onClick={onReset}
        >
          <RotateCcw className="data-action-icon" aria-hidden="true" />
          Resetar tudo
        </button>
      </div>

      <p className="data-actions-help">
        Última exportação de relatório: {formatDateTime(lastExportAt)}
      </p>

      {notice ? (
        <p className="data-actions-notice" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  );
};

export default DataActions;
