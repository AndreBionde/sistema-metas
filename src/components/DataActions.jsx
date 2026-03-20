import { useRef } from "react";
import { FileSpreadsheet, FileText, RotateCcw, Upload } from "lucide-react";
import { formatDateTime } from "../utils/formatters";
import "../styles/DataActions.css";

const DataActions = ({
  onExportCsv,
  onExportXlsx,
  onExportPdf,
  onExportJson,
  onImportJson,
  onReset,
  notice,
  lastExportAt,
  lastImportAt,
}) => {
  const fileInputRef = useRef(null);

  const handleSelectImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      await onImportJson?.(selectedFile);
    }

    event.target.value = "";
  };

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
        <button type="button" className="data-action-button" onClick={onExportJson}>
          <FileText className="data-action-icon" aria-hidden="true" />
          Backup JSON
        </button>
        <button
          type="button"
          className="data-action-button"
          onClick={handleSelectImportFile}
        >
          <Upload className="data-action-icon" aria-hidden="true" />
          Restaurar backup
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

      <input
        ref={fileInputRef}
        className="data-actions-file-input"
        type="file"
        accept="application/json,.json"
        onChange={handleImportFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="data-actions-meta">
        <p className="data-actions-help">
          Última exportação de relatório: {formatDateTime(lastExportAt)}
        </p>
        <p className="data-actions-help">
          Última restauração de backup: {formatDateTime(lastImportAt)}
        </p>
      </div>

      <p className="data-actions-policy">
        Use o backup JSON como cópia restaurável da sua conta. CSV, XLSX e PDF servem
        como relatórios, não como recuperação completa.
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
