import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Alert, Table, Row, Col, Spinner } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { advancedAPI } from '../api/client';
import { ensureButtonVisibility } from '../utils/buttonVisibility';
import '../styles/dashboard.css';

const EXPORT_TYPES = [
  { value: 'firs', label: 'FIR Records', icon: 'fas fa-file-alt', color: '#0ea5e9', desc: 'All FIR records with crime details, status, and workflow stage' },
  { value: 'criminals', label: 'Criminal Records', icon: 'fas fa-user-secret', color: '#ef4444', desc: 'Criminal database with crime types, stations, and status' },
  { value: 'summary', label: 'Crime Summary', icon: 'fas fa-chart-pie', color: '#10b981', desc: 'Aggregate crime statistics by type with status breakdown' },
];

const ExportReports = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [selectedType, setSelectedType] = useState('firs');
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfPrinting, setPdfPrinting] = useState(false);

  // Ensure buttons are always visible on mount and when state changes
  useEffect(() => {
    ensureButtonVisibility();
    
    // Force check immediately
    const checkVisibility = () => {
      const buttons = document.querySelectorAll('.export-buttons-container button, .export-buttons-container .btn');
      buttons.forEach(btn => {
        btn.style.visibility = 'visible';
        btn.style.display = 'inline-flex';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      });
    };
    
    checkVisibility();
    
    // Check again after render completes
    setTimeout(checkVisibility, 0);
    setTimeout(checkVisibility, 100);
    
  }, [previewData, previewLoading, exporting, error, success]);

  // Additional safety: run visibility check periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const btns = document.querySelectorAll('.export-buttons-container button');
      btns.forEach(btn => {
        const style = window.getComputedStyle(btn);
        if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') {
          btn.style.cssText = 'visibility: visible !important; display: inline-flex !important; opacity: 1 !important;';
        }
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  if (role !== 'Admin') {
    navigate('/login');
    return null;
  }

  const handlePreview = async (format) => {
    setError('');
    
    // Guard: prevent multiple simultaneous exports - use specific format keys
    if (exporting) {
      console.warn(`Export format ${exporting} already in progress`);
      return;
    }
    
    if (format === 'csv') {
      await handleCSVExport();
      return;
    }
    
    setExporting(format); // Use format-specific state
    try {
      const res = await advancedAPI.exportJSON(selectedType);
      const data = res.data?.data || [];
      if (data.length === 0) { 
        setError('No data to export');
        setExporting('');
        return; 
      }
      const headers = Object.keys(data[0]);
      setPreviewHeaders(headers);
      setPreviewData({ data, format });
      // Ensure buttons remain visible after state update
      setTimeout(() => ensureButtonVisibility(), 100);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to load data');
      setExporting('');
    }
  };

  const handleCSVExport = async () => {
    setExporting('csv');
    setError('');
    
    try {
      const res = await advancedAPI.exportCSV(selectedType);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedType}_report_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add small delay before revoking to ensure download starts
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      setSuccess('✓ CSV downloaded successfully!');
      // Clear exporting state immediately after download starts
      setExporting('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('CSV export error:', err);
      setError('CSV export failed');
      setExporting('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadExcel = () => {
    if (!previewData?.data) return;
    const data = previewData.data;
    const headers = Object.keys(data[0]);
    const rows = [headers.join('\t'), ...data.map(row => headers.map(h => String(row[h] ?? '').replace(/\t/g, ' ')).join('\t'))];
    const blob = new Blob([rows.join('\n')], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedType}_report_${Date.now()}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
    setSuccess('✓ Excel file downloaded successfully!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handlePrintPDF = () => {
    // Guard: prevent multiple simultaneous PDF exports
    if (!previewData?.data || pdfPrinting) {
      console.warn('PDF export already in progress');
      return;
    }
    
    setPdfPrinting(true);
    const data = previewData.data;
    const headers = Object.keys(data[0]);
    let html = `
      <!DOCTYPE html><html><head><title>Crime Report - ${selectedType}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1e293b; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background: #0ea5e9; color: white; padding: 8px 6px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 30px; color: #94a3b8; font-size: 11px; text-align: center; }
      </style></head><body>
      <h1>Crime Management System — ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Report</h1>
      <p>Generated on ${new Date().toLocaleString()} | Total Records: ${data.length}</p>
      <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    data.forEach(row => {
      html += '<tr>' + headers.map(h => `<td>${row[h] ?? ''}</td>`).join('') + '</tr>';
    });
    html += `</tbody></table><div class="footer">Generated by Crime Management System</div></body></html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { 
      printWindow.print();
      // Don't close the window, let user handle it after printing
      setPdfPrinting(false);
    }, 500);
    
    setSuccess('✓ PDF print dialog opened! Select "Save as PDF" to download.');
    setTimeout(() => setSuccess(''), 5000);
  };

  // If preview data is available, show the preview page
  if (previewData) {
    return (
      <>
        <Sidebar />
        <div className="with-sidebar">
          <Container fluid className="mgmt-container" style={{ background: '#ffffff' }}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 gap-2 flex-wrap" style={{ animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both' }}>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: '1.3rem' }}>
                  <i className={`${EXPORT_TYPES.find(t => t.value === selectedType)?.icon} me-2`} style={{ color: EXPORT_TYPES.find(t => t.value === selectedType)?.color }}></i>
                  {EXPORT_TYPES.find(t => t.value === selectedType)?.label} Preview
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{previewData.data.length} records found</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => setPreviewData(null)}
                  className="fw-bold"
                  style={{ borderRadius: 8, padding: '8px 16px' }}>
                  <i className="fas fa-arrow-left me-1"></i> Back to Export
                </Button>
              </div>
            </div>

            {/* Download Buttons Section */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 12, backgroundColor: '#f0f9ff', borderLeft: '4px solid #0ea5e9' }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <h6 className="fw-bold mb-1"><i className="fas fa-download me-2" style={{ color: '#0ea5e9' }}></i>Download Options</h6>
                    <small className="text-muted">Select a format to download this report</small>
                  </div>
                  <div className="d-flex gap-2">
                    {previewData.format === 'excel' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        style={{ borderRadius: 8, fontWeight: 600, padding: '8px 16px' }} 
                        onClick={handleDownloadExcel}>
                        <i className="fas fa-download me-1"></i> Download Excel
                      </Button>
                    )}
                    {previewData.format === 'pdf' && (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        style={{ borderRadius: 8, fontWeight: 600, padding: '8px 16px' }} 
                        onClick={handlePrintPDF}
                        disabled={pdfPrinting}>
                        {pdfPrinting ? <><Spinner size="sm" className="me-1" /> Generating...</> : <><i className="fas fa-file-pdf me-1"></i> Print as PDF</>}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} style={{ animation: 'fadeInDown 0.3s ease' }}><i className="fas fa-check-circle me-2"></i>{success}</Alert>}

            {/* Preview Table */}
            <Card className="border-0 shadow-sm" style={{ animation: 'fadeInUp 0.4s ease', borderRadius: 12, overflow: 'hidden' }}>
              <Card.Body style={{ padding: 0, maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', overflowX: 'auto' }}>
                <div style={{ minWidth: 'fit-content' }}>
                  <Table hover style={{ marginBottom: 0, fontSize: '0.82rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#0f172a', minWidth: 60 }}>Sr. No.</th>
                        {previewHeaders.map(h => (
                          <th key={h} style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#0f172a', whiteSpace: 'nowrap', minWidth: 120 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, minWidth: 60 }}>{idx + 1}</td>
                          {previewHeaders.map(h => (
                            <td key={h} style={{ padding: '8px 12px', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 120 }}>{row[h] ?? '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Bottom Back Button */}
            <div className="d-flex justify-content-center gap-2 mt-4 mb-3">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => setPreviewData(null)}
                className="fw-bold"
                style={{ borderRadius: 8, padding: '8px 20px' }}>
                <i className="fas fa-arrow-left me-1"></i> Back to Export
              </Button>
            </div>
          </Container>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container" style={{ background: '#ffffff' }}>
          <style>{`
            /* ===== BUTTON VISIBILITY RULES - Never allow hiding ===== */
            .export-buttons-container {
              visibility: visible !important;
              display: block !important;
              opacity: 1 !important;
              pointer-events: auto !important;
              z-index: 5 !important;
              position: relative !important;
            }
            
            .export-buttons-container .btn {
              visibility: visible !important;
              display: inline-flex !important;
              opacity: 1 !important;
              pointer-events: auto !important;
            }

            .export-buttons-container .btn:disabled {
              opacity: 0.6 !important;
              pointer-events: auto !important;
              cursor: not-allowed !important;
              visibility: visible !important;
            }

            /* Bootstrap button safeguards */
            .btn, button {
              visibility: visible !important;
              display: inline-flex !important;
              opacity: 1 !important;
            }

            .btn-success, .btn-primary, .btn-danger {
              visibility: visible !important;
              display: inline-flex !important;
              opacity: 1 !important;
            }

            /* Prevent Card from hiding buttons */
            .card {
              visibility: visible !important;
              opacity: 1 !important;
            }

            .card-body {
              visibility: visible !important;
              opacity: 1 !important;
            }

            /* Row and Col button containers */
            .row button, .col button {
              visibility: visible !important;
              display: inline-flex !important;
              opacity: 1 !important;
            }
          `}</style>

          {/* ── Page header ── */}
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap" style={{ animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both' }}>
            <div>
              <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: '1.3rem' }}>
                <i className="fas fa-download me-2" style={{ color: '#10b981' }}></i>Export Reports
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Download crime statistics in CSV, Excel, or PDF formats</p>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)} className="fw-bold">
              <i className="fas fa-arrow-left me-1"></i>Back
            </Button>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')} style={{ animation: 'fadeInDown 0.3s ease' }}><i className="fas fa-exclamation-circle me-2"></i>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} style={{ animation: 'fadeInDown 0.3s ease' }}><i className="fas fa-check-circle me-2"></i>{success}</Alert>}

          {/* Data Type Selection */}
          <Row className="g-3 mb-4">
            {EXPORT_TYPES.map((t, i) => (
              <Col md={4} xs={12} key={t.value}>
                <Card
                  className="border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    border: selectedType === t.value ? `2px solid ${t.color}` : '2px solid #e0e0e0',
                    background: selectedType === t.value ? t.color + '08' : '#ffffff',
                    transition: 'all 0.3s ease',
                    transform: selectedType === t.value ? 'translateY(-4px)' : 'translateY(0)',
                    borderRadius: 12,
                    animation: `fadeInUp ${0.3 + i * 0.1}s ease`,
                    boxShadow: selectedType === t.value ? `0 8px 20px ${t.color}20` : '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  onClick={() => setSelectedType(t.value)}
                >
                  <Card.Body className="text-center py-4">
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: t.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px', transition: 'transform 0.3s',
                      transform: selectedType === t.value ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      <i className={t.icon} style={{ fontSize: '1.5rem', color: t.color }}></i>
                    </div>
                    <h6 className="fw-bold mb-2" style={{ fontSize: '1rem' }}>{t.label}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{t.desc}</p>
                    {selectedType === t.value && (
                      <div className="mt-2"><i className="fas fa-check-circle" style={{ color: t.color, fontSize: '1.1rem' }}></i></div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Export Buttons Section */}
          <div className="export-buttons-container" style={{ 
            position: 'relative', 
            zIndex: 5, 
            visibility: 'visible', 
            display: 'block',
            opacity: 1,
            pointerEvents: 'auto'
          }}>
            <Card className="border-0 shadow-sm" style={{ 
              borderRadius: 12, 
              animation: 'fadeInUp 0.5s ease', 
              marginBottom: '30px', 
              visibility: 'visible',
              display: 'block',
              opacity: 1
            }}>
              <Card.Body className="p-4" style={{ visibility: 'visible', display: 'block' }}>
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-file-export me-2" style={{ color: '#6366f1' }}></i>
                  Export {EXPORT_TYPES.find(t => t.value === selectedType)?.label || 'Data'}
                </h6>
                <Row className="g-3" style={{ visibility: 'visible', display: 'flex' }}>
                  <Col md={4} xs={12} style={{ visibility: 'visible', display: 'block' }}>
                    <Button
                      variant="success"
                      className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handlePreview('csv')}
                      disabled={exporting === 'csv'}
                      style={{ 
                        borderRadius: 10, 
                        fontSize: '0.95rem', 
                        transition: 'all 0.2s ease', 
                        fontWeight: 600, 
                        minHeight: '56px', 
                        display: 'inline-flex !important', 
                        visibility: 'visible !important', 
                        opacity: 1,
                        width: '100%',
                        pointerEvents: 'auto',
                        cursor: exporting === 'csv' ? 'not-allowed' : 'pointer',
                        background: exporting === 'csv' ? '#10b981' : undefined
                      }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {exporting === 'csv' ? <Spinner size="sm" /> : <i className="fas fa-file-csv" style={{ fontSize: '1.2rem' }}></i>}
                      <span>{exporting === 'csv' ? 'Downloading...' : 'Download CSV'}</span>
                    </Button>
                  </Col>
                  <Col md={4} xs={12} style={{ visibility: 'visible', display: 'block' }}>
                    <Button
                      variant="primary"
                      className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handlePreview('excel')}
                      disabled={exporting === 'excel'}
                      style={{ 
                        borderRadius: 10, 
                        fontSize: '0.95rem', 
                        transition: 'all 0.2s ease', 
                        fontWeight: 600, 
                        minHeight: '56px', 
                        display: 'inline-flex !important', 
                        visibility: 'visible !important', 
                        opacity: 1,
                        width: '100%',
                        pointerEvents: 'auto',
                        cursor: exporting === 'excel' ? 'not-allowed' : 'pointer',
                        background: exporting === 'excel' ? '#0ea5e9' : undefined
                      }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {exporting === 'excel' ? <Spinner size="sm" /> : <i className="fas fa-file-excel" style={{ fontSize: '1.2rem' }}></i>}
                      <span>{exporting === 'excel' ? 'Loading...' : 'Preview Excel'}</span>
                    </Button>
                  </Col>
                  <Col md={4} xs={12} style={{ visibility: 'visible', display: 'block' }}>
                    <Button
                      variant="danger"
                      className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handlePreview('pdf')}
                      disabled={exporting === 'pdf'}
                      style={{ 
                        borderRadius: 10, 
                        fontSize: '0.95rem', 
                        transition: 'all 0.2s ease', 
                        fontWeight: 600, 
                        minHeight: '56px', 
                        display: 'inline-flex !important', 
                        visibility: 'visible !important', 
                        opacity: 1,
                        width: '100%',
                        pointerEvents: 'auto',
                        cursor: exporting === 'pdf' ? 'not-allowed' : 'pointer',
                        background: exporting === 'pdf' ? '#ef4444' : undefined
                      }}
                      onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {exporting === 'pdf' ? <Spinner size="sm" /> : <i className="fas fa-file-pdf" style={{ fontSize: '1.2rem' }}></i>}
                      <span>{exporting === 'pdf' ? 'Loading...' : 'Preview PDF'}</span>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <Footer />
      </div>
    </>
  );
};

export default ExportReports;
