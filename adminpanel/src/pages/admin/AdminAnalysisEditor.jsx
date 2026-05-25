
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import AdminLayout from './AdminLayout';
// import ImageUploader from './ImageUploader';
// import VideoUploader from './VideoUploader';
// import api from '../../utils/api';
// import { toast } from 'react-toastify';
// import './AdminAnalysisEditor.css';

// // ── Default empty blocks ──────────────────────────────────────
// const NEW_BLOCK = {
//   text:  () => ({ type: 'text',  order: 0, textContent: '' }),
//   code:  () => ({ type: 'code',  order: 0, codeContent: '', codeLanguage: 'python', codeTitle: '' }),
//   image: () => ({ type: 'image', order: 0, imageUrl: '', imageCaption: '' }),
//   video: () => ({ type: 'video', order: 0, videoUrl: '', videoTitle: '' }),
//   table: () => ({ type: 'table', order: 0, tableHeaders: ['Column 1', 'Column 2'], tableRows: [['', '']] }),
// };

// const BLOCK_ICONS  = { text: '¶', code: '{ }', image: '◻', video: '▶', table: '⊟' };
// const BLOCK_COLORS = {
//   text:  '#0891b2',
//   code:  '#5cc1d0',
//   image: '#9333ea',
//   video: '#ea580c',
//   table: '#f59e0b',
// };

// // ─────────────────────────────────────────────────────────────
// // TABLE PARSERS (shared between paste handler + nb importer)
// // ─────────────────────────────────────────────────────────────

// function parseHtmlTable(html) {
//   try {
//     const doc   = new DOMParser().parseFromString(html, 'text/html');
//     const table = doc.querySelector('table');
//     if (!table) return null;

//     const text  = (cell) => cell.textContent.trim();
//     const thead = table.querySelector('thead');
//     const tbody = table.querySelector('tbody');

//     let headerRow, dataRows;
//     if (thead) {
//       const rows = Array.from(thead.querySelectorAll('tr'));
//       headerRow  = rows[rows.length - 1];
//       dataRows   = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
//     } else {
//       const rows = Array.from(table.querySelectorAll('tr'));
//       if (!rows.length) return null;
//       headerRow = rows[0];
//       dataRows  = rows.slice(1);
//     }

//     let headers = Array.from(headerRow.querySelectorAll('th, td')).map(text);
//     if (headers[0] === '') headers[0] = '#';
//     if (!headers.length) return null;

//     const rows = dataRows
//       .map(tr => {
//         const cells = Array.from(tr.querySelectorAll('th, td')).map(text);
//         while (cells.length < headers.length) cells.push('');
//         return cells.slice(0, headers.length);
//       })
//       .filter(r => r.some(c => c !== ''));

//     return rows.length ? { headers, rows } : null;
//   } catch { return null; }
// }

// function parsePlainTextTable(raw) {
//   const lines = raw.trim().split(/\r?\n/);
//   if (lines.length < 2) return null;
//   const isTab = lines[0].includes('\t');

//   const splitRow = (line) => {
//     if (isTab) return line.split('\t');
//     const out = []; let cur = '', inQ = false;
//     for (const ch of line) {
//       if (ch === '"') { inQ = !inQ; }
//       else if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ''; }
//       else { cur += ch; }
//     }
//     out.push(cur.trim());
//     return out;
//   };

//   const parsed  = lines.map(splitRow);
//   const headers = parsed[0].map(h => h || 'Column');
//   const rows    = parsed.slice(1).map(r => {
//     while (r.length < headers.length) r.push('');
//     return r.slice(0, headers.length);
//   });
//   return { headers, rows };
// }

// function parsePandasRepr(text) {
//   try {
//     const lines = text.trim().split(/\r?\n/)
//       .filter(l => l.trim() && !/^[\s\-|+]+$/.test(l));
//     if (lines.length < 2) return null;

//     const split = (l) => l.trim().split(/\s{2,}/);
//     const headers = split(lines[0]);
//     if (headers[0] === '') headers[0] = '#';

//     const rows = lines.slice(1).map(l => {
//       const c = split(l);
//       while (c.length < headers.length) c.push('');
//       return c.slice(0, headers.length);
//     });
//     return rows.length ? { headers, rows } : null;
//   } catch { return null; }
// }

// // ─────────────────────────────────────────────────────────────
// // NOTEBOOK CONVERTER
// // Converts a parsed .ipynb object into an array of content blocks
// // ready to drop into the editor. Each block has the same shape
// // as NEW_BLOCK factory output plus a _nbMeta field for the preview.
// // ─────────────────────────────────────────────────────────────

// /**
//  * Detect notebook kernel language (best-effort).
//  * Falls back to 'python'.
//  */
// function detectLanguage(nb) {
//   const lang =
//     nb.metadata?.kernelspec?.language ||
//     nb.metadata?.language_info?.name  ||
//     'python';
//   // Normalise to our dropdown values
//   const map = { python: 'python', r: 'r', bash: 'bash', shell: 'bash', sql: 'sql' };
//   return map[lang.toLowerCase()] || 'python';
// }

// /**
//  * Join a nbformat source field (string | string[]) into a plain string.
//  */
// const joinSource = (s) => (Array.isArray(s) ? s.join('') : s || '').trimEnd();

// /**
//  * Convert a full .ipynb notebook into content blocks.
//  * Returns { blocks, skipped }
//  *   blocks  — array of block objects (with extra _nbMeta for preview)
//  *   skipped — array of { cellIndex, reason } for things we couldn't convert
//  */
// function convertNotebookToBlocks(nb) {
//   const blocks  = [];
//   const skipped = [];
//   const lang    = detectLanguage(nb);
//   const cells   = nb.cells || [];

//   cells.forEach((cell, cellIndex) => {
//     const source = joinSource(cell.source);

//     // ── MARKDOWN cell ──────────────────────────────────────
//     if (cell.cell_type === 'markdown') {
//       if (!source.trim()) return; // skip blank markdown cells
//       blocks.push({
//         type: 'text',
//         order: 0,
//         textContent: source,
//         _nbMeta: { cellIndex, cellType: 'markdown', preview: source.slice(0, 120) },
//       });
//       return;
//     }

//     // ── RAW cell ───────────────────────────────────────────
//     if (cell.cell_type === 'raw') {
//       if (!source.trim()) return;
//       blocks.push({
//         type: 'text',
//         order: 0,
//         textContent: source,
//         _nbMeta: { cellIndex, cellType: 'raw', preview: source.slice(0, 120) },
//       });
//       return;
//     }

//     // ── CODE cell ──────────────────────────────────────────
//     if (cell.cell_type === 'code') {
//       // 1. Add the source code as a code block (skip if empty)
//       if (source.trim()) {
//         blocks.push({
//           type: 'code',
//           order: 0,
//           codeContent:  source,
//           codeLanguage: lang,
//           codeTitle:    '',
//           _nbMeta: { cellIndex, cellType: 'code', preview: source.slice(0, 120) },
//         });
//       }

//       // 2. Process outputs
//       const outputs = cell.outputs || [];
//       outputs.forEach((output, outputIndex) => {
//         const outputType = output.output_type; // execute_result | display_data | stream | error

//         // ── error outputs — skip silently ──
//         if (outputType === 'error') return;

//         // ── stream output (stdout / stderr) ──
//         if (outputType === 'stream') {
//           const text = joinSource(output.text);
//           if (!text.trim()) return;

//           // Try to parse as table first
//           const tbl = parsePlainTextTable(text) || parsePandasRepr(text);
//           if (tbl) {
//             blocks.push({
//               type: 'table',
//               order: 0,
//               tableHeaders: tbl.headers,
//               tableRows:    tbl.rows,
//               _nbMeta: { cellIndex, cellType: 'output-table', outputIndex, preview: `${tbl.headers.length} cols × ${tbl.rows.length} rows` },
//             });
//           } else {
//             blocks.push({
//               type: 'text',
//               order: 0,
//               textContent: text,
//               _nbMeta: { cellIndex, cellType: 'output-text', outputIndex, preview: text.slice(0, 120) },
//             });
//           }
//           return;
//         }

//         // ── display_data / execute_result ──
//         const data = output.data || {};

//         // Priority: HTML table > plain-text table > plain text > image (skip)
//         const htmlRaw  = data['text/html'];
//         const plainRaw = data['text/plain'];
//         const imgPng   = data['image/png'];
//         const imgSvg   = data['image/svg+xml'];

//         if (htmlRaw) {
//           const html = Array.isArray(htmlRaw) ? htmlRaw.join('') : htmlRaw;
//           const tbl  = parseHtmlTable(html);
//           if (tbl) {
//             blocks.push({
//               type: 'table',
//               order: 0,
//               tableHeaders: tbl.headers,
//               tableRows:    tbl.rows,
//               _nbMeta: { cellIndex, cellType: 'output-table', outputIndex, preview: `${tbl.headers.length} cols × ${tbl.rows.length} rows` },
//             });
//             return;
//           }
//           // HTML output that isn't a table — extract plain text
//           const doc  = new DOMParser().parseFromString(html, 'text/html');
//           const txt  = doc.body.textContent.trim();
//           if (txt) {
//             blocks.push({
//               type: 'text',
//               order: 0,
//               textContent: txt,
//               _nbMeta: { cellIndex, cellType: 'output-text', outputIndex, preview: txt.slice(0, 120) },
//             });
//           }
//           return;
//         }

//         if (plainRaw) {
//           const text = Array.isArray(plainRaw) ? plainRaw.join('') : plainRaw;
//           if (!text.trim()) return;
//           const tbl  = parsePlainTextTable(text) || parsePandasRepr(text);
//           if (tbl) {
//             blocks.push({
//               type: 'table',
//               order: 0,
//               tableHeaders: tbl.headers,
//               tableRows:    tbl.rows,
//               _nbMeta: { cellIndex, cellType: 'output-table', outputIndex, preview: `${tbl.headers.length} cols × ${tbl.rows.length} rows` },
//             });
//           } else {
//             blocks.push({
//               type: 'text',
//               order: 0,
//               textContent: text,
//               _nbMeta: { cellIndex, cellType: 'output-text', outputIndex, preview: text.slice(0, 120) },
//             });
//           }
//           return;
//         }

//         // Image outputs — we can't upload them automatically
//         if (imgPng || imgSvg) {
//           skipped.push({ cellIndex, outputIndex, reason: 'Image output (PNG/SVG) — upload manually via the image block.' });
//         }
//       });
//     }
//   });

//   return { blocks, skipped };
// }

// // ─────────────────────────────────────────────────────────────
// // NOTEBOOK IMPORT MODAL
// // Full-notebook importer: drop a .ipynb → preview all generated
// // blocks → toggle individual ones on/off → confirm import.
// // ─────────────────────────────────────────────────────────────

// const NB_TYPE_LABELS = {
//   'markdown':     { label: 'Markdown',     color: '#0891b2', icon: '¶'   },
//   'raw':          { label: 'Raw text',     color: '#64748b', icon: '¶'   },
//   'code':         { label: 'Code',         color: '#5cc1d0', icon: '{ }' },
//   'output-table': { label: 'Table output', color: '#f59e0b', icon: '⊟'  },
//   'output-text':  { label: 'Text output',  color: '#8898aa', icon: '¶'   },
// };

// function NotebookImportModal({ onImport, onClose }) {
//   const fileRef = useRef();
//   const [step,      setStep]      = useState('drop');   // drop | preview | done
//   const [fileName,  setFileName]  = useState('');
//   const [error,     setError]     = useState('');
//   const [blocks,    setBlocks]    = useState([]);        // converted blocks
//   const [skipped,   setSkipped]   = useState([]);
//   const [selected,  setSelected]  = useState(new Set()); // indices of blocks to import

//   const handleFile = (file) => {
//     if (!file) return;
//     if (!file.name.endsWith('.ipynb')) { setError('Please upload a .ipynb file.'); return; }
//     setError('');
//     setFileName(file.name);

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const nb = JSON.parse(e.target.result);
//         const { blocks: converted, skipped: sk } = convertNotebookToBlocks(nb);
//         if (!converted.length) {
//           setError('No content blocks could be extracted from this notebook. Make sure cells have been run and saved.');
//           return;
//         }
//         setBlocks(converted);
//         setSkipped(sk);
//         setSelected(new Set(converted.map((_, i) => i))); // all selected by default
//         setStep('preview');
//       } catch {
//         setError('Could not parse the file. Make sure it is a valid .ipynb JSON.');
//       }
//     };
//     reader.onerror = () => setError('Failed to read the file.');
//     reader.readAsText(file);
//   };

//   const toggleBlock = (i) => {
//     setSelected(prev => {
//       const next = new Set(prev);
//       next.has(i) ? next.delete(i) : next.add(i);
//       return next;
//     });
//   };

//   const toggleAll = () => {
//     setSelected(prev =>
//       prev.size === blocks.length ? new Set() : new Set(blocks.map((_, i) => i))
//     );
//   };

//   const handleConfirm = () => {
//     const chosen = blocks
//       .filter((_, i) => selected.has(i))
//       .map(({ _nbMeta, ...rest }) => rest); // strip preview metadata before handing off
//     onImport(chosen);
//     onClose();
//   };

//   // ── Styles ────────────────────────────────────────────────
//   const overlay = {
//     position: 'fixed', inset: 0, zIndex: 1000,
//     background: 'rgba(15,23,42,0.55)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     padding: '20px',
//   };
//   const modal = {
//     background: '#fff', borderRadius: 14,
//     width: '100%', maxWidth: 680,
//     maxHeight: '88vh', display: 'flex', flexDirection: 'column',
//     boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
//     overflow: 'hidden',
//   };

//   return (
//     <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
//       <div style={modal}>

//         {/* Header */}
//         <div style={{
//           padding: '16px 20px', borderBottom: '1px solid #e4e8ee',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(92,193,208,0.06))',
//           flexShrink: 0,
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <span style={{ fontSize: 22 }}>📓</span>
//             <div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
//                 Import Jupyter Notebook
//               </div>
//               {fileName && (
//                 <div style={{ fontSize: 11, color: '#8898aa', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
//                   {fileName}
//                 </div>
//               )}
//             </div>
//           </div>
//           <button onClick={onClose} style={{
//             background: 'none', border: 'none', fontSize: 20,
//             color: '#8898aa', cursor: 'pointer', lineHeight: 1, padding: '0 4px',
//           }}>×</button>
//         </div>

//         {/* Body */}
//         <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

//           {/* ── STEP: drop ── */}
//           {step === 'drop' && (
//             <>
//               <div
//                 onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
//                 onDragOver={e => e.preventDefault()}
//                 onClick={() => fileRef.current?.click()}
//                 style={{
//                   border: '2px dashed #f59e0b', borderRadius: 12,
//                   padding: '48px 20px', textAlign: 'center',
//                   cursor: 'pointer', background: 'rgba(245,158,11,0.04)',
//                   transition: 'background 0.15s',
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.09)'}
//                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.04)'}
//               >
//                 <div style={{ fontSize: 40, marginBottom: 12 }}>📓</div>
//                 <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
//                   Drop your .ipynb file here
//                 </div>
//                 <div style={{ fontSize: 13, color: '#b7791f' }}>or click to browse</div>
//                 <div style={{ fontSize: 12, color: '#8898aa', marginTop: 14, lineHeight: 1.6 }}>
//                   All cell types are imported: markdown → text blocks,
//                   code cells → code blocks,<br />
//                   DataFrame outputs → table blocks, print outputs → text blocks.<br />
//                   Image outputs are skipped (upload manually via image block).
//                 </div>
//                 <input
//                   ref={fileRef} type="file" accept=".ipynb,application/json"
//                   style={{ display: 'none' }}
//                   onChange={e => handleFile(e.target.files[0])}
//                 />
//               </div>
//               {error && (
//                 <div style={{
//                   marginTop: 14, fontSize: 12, color: '#c53030',
//                   padding: '10px 14px', background: 'rgba(229,62,62,0.07)',
//                   border: '1px solid rgba(229,62,62,0.18)', borderRadius: 8, lineHeight: 1.5,
//                 }}>
//                   {error}
//                 </div>
//               )}
//             </>
//           )}

//           {/* ── STEP: preview ── */}
//           {step === 'preview' && (
//             <>
//               {/* Summary bar */}
//               <div style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 marginBottom: 14, flexWrap: 'wrap', gap: 8,
//               }}>
//                 <div style={{ fontSize: 13, color: '#4a5568' }}>
//                   <strong style={{ color: '#1a202c' }}>{blocks.length}</strong> blocks detected
//                   {skipped.length > 0 && (
//                     <span style={{ color: '#e53e3e', marginLeft: 8 }}>
//                       · {skipped.length} skipped (images)
//                     </span>
//                   )}
//                   <span style={{ color: '#8898aa', marginLeft: 8 }}>
//                     · {selected.size} selected for import
//                   </span>
//                 </div>
//                 <div style={{ display: 'flex', gap: 8 }}>
//                   <button
//                     onClick={toggleAll}
//                     style={{
//                       fontSize: 12, padding: '5px 12px', borderRadius: 7,
//                       border: '1px solid #e4e8ee', background: '#f7f8fa',
//                       color: '#4a5568', cursor: 'pointer',
//                     }}
//                   >
//                     {selected.size === blocks.length ? 'Deselect all' : 'Select all'}
//                   </button>
//                   <button
//                     onClick={() => { setStep('drop'); setBlocks([]); setFileName(''); setError(''); }}
//                     style={{
//                       fontSize: 12, padding: '5px 12px', borderRadius: 7,
//                       border: '1px solid #e4e8ee', background: '#f7f8fa',
//                       color: '#4a5568', cursor: 'pointer',
//                     }}
//                   >
//                     ↩ Change file
//                   </button>
//                 </div>
//               </div>

//               {/* Skipped items notice */}
//               {skipped.length > 0 && (
//                 <div style={{
//                   marginBottom: 14, padding: '10px 14px',
//                   background: 'rgba(229,62,62,0.06)',
//                   border: '1px solid rgba(229,62,62,0.15)',
//                   borderRadius: 8, fontSize: 12, color: '#c53030', lineHeight: 1.6,
//                 }}>
//                   <strong>Skipped outputs:</strong>
//                   <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
//                     {skipped.map((s, i) => (
//                       <li key={i}>Cell {s.cellIndex + 1}, Output {s.outputIndex + 1}: {s.reason}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Block list */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                 {blocks.map((block, i) => {
//                   const meta   = block._nbMeta || {};
//                   const info   = NB_TYPE_LABELS[meta.cellType] || { label: block.type, color: '#8898aa', icon: '¶' };
//                   const isOn   = selected.has(i);

//                   return (
//                     <div
//                       key={i}
//                       onClick={() => toggleBlock(i)}
//                       style={{
//                         display: 'flex', alignItems: 'flex-start', gap: 12,
//                         padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
//                         border: `1.5px solid ${isOn ? info.color + '55' : '#e4e8ee'}`,
//                         background: isOn ? info.color + '0a' : '#fafbfc',
//                         transition: 'border-color 0.15s, background 0.15s',
//                         userSelect: 'none',
//                       }}
//                     >
//                       {/* Checkbox */}
//                       <div style={{
//                         width: 18, height: 18, borderRadius: 5, flexShrink: 0,
//                         border: `2px solid ${isOn ? info.color : '#cbd5e0'}`,
//                         background: isOn ? info.color : '#fff',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         marginTop: 1,
//                         transition: 'border-color 0.15s, background 0.15s',
//                       }}>
//                         {isOn && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
//                       </div>

//                       {/* Icon + info */}
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
//                           <span style={{
//                             fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
//                             color: info.color, fontWeight: 700,
//                           }}>
//                             {info.icon} {info.label}
//                           </span>
//                           <span style={{
//                             fontSize: 10, color: '#8898aa',
//                             fontFamily: 'JetBrains Mono, monospace',
//                           }}>
//                             Cell {meta.cellIndex + 1}
//                             {meta.outputIndex !== undefined ? `, Output ${meta.outputIndex + 1}` : ''}
//                           </span>
//                         </div>
//                         <div style={{
//                           fontSize: 12, color: '#4a5568',
//                           fontFamily: meta.cellType === 'code' ? 'JetBrains Mono, monospace' : 'inherit',
//                           whiteSpace: 'pre-wrap', wordBreak: 'break-word',
//                           maxHeight: 56, overflow: 'hidden',
//                           opacity: isOn ? 1 : 0.45,
//                         }}>
//                           {meta.preview || '(empty)'}
//                           {(meta.preview || '').length >= 120 ? '…' : ''}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         {step === 'preview' && (
//           <div style={{
//             padding: '14px 20px', borderTop: '1px solid #e4e8ee',
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             background: '#f7f8fa', flexShrink: 0,
//           }}>
//             <span style={{ fontSize: 12, color: '#8898aa' }}>
//               {selected.size === 0
//                 ? 'Select at least one block to import'
//                 : `${selected.size} block${selected.size !== 1 ? 's' : ''} will be appended to the editor`}
//             </span>
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 16px' }}>
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirm}
//                 disabled={selected.size === 0}
//                 style={{
//                   fontSize: 13, fontWeight: 600,
//                   padding: '7px 20px', borderRadius: 8, border: 'none',
//                   background: selected.size ? '#f59e0b' : '#e2e8f0',
//                   color: selected.size ? '#fff' : '#a0aec0',
//                   cursor: selected.size ? 'pointer' : 'not-allowed',
//                   fontFamily: 'DM Sans, system-ui, sans-serif',
//                   transition: 'background 0.15s',
//                 }}
//               >
//                 Import {selected.size > 0 ? `${selected.size} block${selected.size !== 1 ? 's' : ''}` : ''}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // BLOCK EDITORS
// // ─────────────────────────────────────────────────────────────

// function TextBlockEditor({ block, onChange }) {
//   return (
//     <div className="block-editor-body">
//       <textarea
//         rows={6}
//         placeholder="Write your explanation here. Use blank lines to separate paragraphs."
//         value={block.textContent || ''}
//         onChange={e => onChange({ textContent: e.target.value })}
//       />
//     </div>
//   );
// }

// function CodeBlockEditor({ block, onChange }) {
//   return (
//     <div className="block-editor-body">
//       <div className="block-editor-row">
//         <div className="form-col">
//           <label>Code Title (optional)</label>
//           <input type="text" placeholder="e.g. OLS Regression Example"
//             value={block.codeTitle || ''} onChange={e => onChange({ codeTitle: e.target.value })} />
//         </div>
//         <div className="form-col" style={{ maxWidth: 160 }}>
//           <label>Language</label>
//           <select value={block.codeLanguage || 'python'} onChange={e => onChange({ codeLanguage: e.target.value })}>
//             <option value="python">Python</option>
//             <option value="r">R</option>
//             <option value="bash">Bash</option>
//             <option value="sql">SQL</option>
//             <option value="json">JSON</option>
//           </select>
//         </div>
//       </div>
//       <textarea
//         rows={12} className="code-textarea"
//         placeholder={'# Paste your Python code here\nimport pandas as pd\n...'}
//         value={block.codeContent || ''}
//         onChange={e => onChange({ codeContent: e.target.value })}
//         spellCheck={false}
//       />
//     </div>
//   );
// }

// function ImageBlockEditor({ block, onChange }) {
//   const [showPicker, setShowPicker] = useState(!block.imageUrl);
//   const handleSelect = (url) => { onChange({ imageUrl: url }); setShowPicker(false); };

//   return (
//     <div className="block-editor-body">
//       {block.imageUrl && !showPicker && (
//         <div className="current-media-preview">
//           <img src={block.imageUrl} alt="selected" className="current-media-img" />
//           <div className="current-media-actions">
//             <span className="current-media-url" title={block.imageUrl}>{block.imageUrl}</span>
//             <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
//               onClick={() => setShowPicker(true)}>✎ Change</button>
//           </div>
//         </div>
//       )}
//       {showPicker && (
//         <div className="media-picker-section">
//           <div className="media-picker-header">
//             <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select an image</span>
//             {block.imageUrl && (
//               <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
//                 onClick={() => setShowPicker(false)}>Cancel</button>
//             )}
//           </div>
//           <ImageUploader currentUrl={block.imageUrl} onSelect={handleSelect} />
//         </div>
//       )}
//       <div className="form-col">
//         <label>Caption <span className="field-hint-inline">(optional)</span></label>
//         <input type="text" placeholder="Figure 1: Residuals vs Fitted values"
//           value={block.imageCaption || ''} onChange={e => onChange({ imageCaption: e.target.value })} />
//       </div>
//     </div>
//   );
// }

// function VideoBlockEditor({ block, onChange }) {
//   const [showPicker, setShowPicker] = useState(!block.videoUrl);

//   const getYTThumb = (url) => {
//     const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
//     return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
//   };

//   const isYT    = Boolean(block.videoUrl && getYTThumb(block.videoUrl));
//   const ytThumb = isYT ? getYTThumb(block.videoUrl) : null;
//   const handleSelect = (url) => { onChange({ videoUrl: url }); setShowPicker(false); };

//   return (
//     <div className="block-editor-body">
//       {block.videoUrl && !showPicker && (
//         <div className="current-media-preview">
//           {isYT
//             ? <img src={ytThumb} alt="YouTube thumbnail" className="current-media-img" />
//             : <video src={block.videoUrl} controls muted className="current-media-video" />}
//           <div className="current-media-actions">
//             <span className="current-media-url" title={block.videoUrl}>{block.videoUrl}</span>
//             <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
//               onClick={() => setShowPicker(true)}>✎ Change</button>
//           </div>
//         </div>
//       )}
//       {showPicker && (
//         <div className="media-picker-section">
//           <div className="media-picker-header">
//             <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select a video</span>
//             {block.videoUrl && (
//               <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
//                 onClick={() => setShowPicker(false)}>Cancel</button>
//             )}
//           </div>
//           <VideoUploader currentUrl={block.videoUrl} onSelect={handleSelect} />
//         </div>
//       )}
//       <div className="form-col">
//         <label>Video Title <span className="field-hint-inline">(optional)</span></label>
//         <input type="text" placeholder="e.g. Visualizing Regression Coefficients"
//           value={block.videoTitle || ''} onChange={e => onChange({ videoTitle: e.target.value })} />
//       </div>
//     </div>
//   );
// }

// function TableBlockEditor({ block, onChange }) {
//   const headers = block.tableHeaders || ['Column 1'];
//   const rows    = block.tableRows    || [['']];
//   const [pasteError,   setPasteError]   = useState('');
//   const [pasteSuccess, setPasteSuccess] = useState('');

//   const updateHeader = (i, val) => { const h = [...headers]; h[i] = val; onChange({ tableHeaders: h }); };
//   const updateCell   = (r, c, val) => {
//     const nr = rows.map(row => [...row]); nr[r][c] = val; onChange({ tableRows: nr });
//   };
//   const addColumn    = () => onChange({
//     tableHeaders: [...headers, `Column ${headers.length + 1}`],
//     tableRows: rows.map(r => [...r, '']),
//   });
//   const removeColumn = (ci) => {
//     if (headers.length <= 1) return;
//     onChange({
//       tableHeaders: headers.filter((_, i) => i !== ci),
//       tableRows: rows.map(r => r.filter((_, i) => i !== ci)),
//     });
//   };
//   const addRow    = () => onChange({ tableRows: [...rows, headers.map(() => '')] });
//   const removeRow = (ri) => {
//     if (rows.length <= 1) return;
//     onChange({ tableRows: rows.filter((_, i) => i !== ri) });
//   };

//   const applyParsed = ({ headers: h, rows: r }) => {
//     onChange({ tableHeaders: h, tableRows: r });
//     setPasteSuccess(`Imported ${h.length} cols × ${r.length} rows`);
//     setTimeout(() => setPasteSuccess(''), 3500);
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     setPasteError(''); setPasteSuccess('');
//     const html  = e.clipboardData.getData('text/html');
//     const plain = e.clipboardData.getData('text/plain');
//     const parsed = (html && parseHtmlTable(html))
//                 || (plain && (parsePlainTextTable(plain) || parsePandasRepr(plain)));
//     if (parsed) { applyParsed(parsed); return; }
//     setPasteError('Could not detect a table. Paste a selection from Excel, Google Sheets, or a Jupyter cell output.');
//   };

//   return (
//     <div className="block-editor-body">
//       <div
//         onPaste={handlePaste} tabIndex={0}
//         style={{
//           border: `1.5px dashed ${pasteSuccess ? '#38a169' : '#5cc1d0'}`,
//           borderRadius: 10, padding: '12px 16px', marginBottom: 10,
//           background: pasteSuccess ? 'rgba(56,161,105,0.06)' : 'rgba(92,193,208,0.05)',
//           cursor: 'text', outline: 'none', fontSize: 13,
//           transition: 'background 0.15s, border-color 0.15s',
//         }}
//         onFocus={e => { if (!pasteSuccess) e.currentTarget.style.background = 'rgba(92,193,208,0.11)'; }}
//         onBlur={e  => { if (!pasteSuccess) e.currentTarget.style.background = pasteSuccess ? 'rgba(56,161,105,0.06)' : 'rgba(92,193,208,0.05)'; }}
//       >
//         {pasteSuccess ? (
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38a169', fontWeight: 600 }}>
//             <span>✓</span><span>{pasteSuccess}</span>
//             <span style={{ fontWeight: 400, color: '#68a885', fontSize: 11, marginLeft: 4 }}>— edit below or paste again to replace</span>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#5cc1d0' }}>
//             <span style={{ fontSize: 17 }}>⊟</span>
//             <div>
//               <span style={{ fontWeight: 600 }}>Click here, then paste</span>
//               <span style={{ color: '#4a5568', marginLeft: 6 }}>from:</span>
//               <span style={{ color: '#8898aa', marginLeft: 8, fontSize: 12 }}>Excel · Google Sheets · Jupyter cell output</span>
//               <span style={{ color: '#b0bec5', marginLeft: 10, fontSize: 11 }}>Ctrl+V / Cmd+V</span>
//             </div>
//           </div>
//         )}
//       </div>
//       {pasteError && (
//         <div style={{
//           color: '#c53030', fontSize: 12, marginBottom: 10,
//           padding: '8px 12px', background: 'rgba(229,62,62,0.07)',
//           border: '1px solid rgba(229,62,62,0.18)', borderRadius: 8, lineHeight: 1.5,
//         }}>{pasteError}</div>
//       )}
//       <div className="table-editor-scroll">
//         <table className="table-editor">
//           <thead>
//             <tr>
//               {headers.map((h, i) => (
//                 <th key={i}>
//                   <div className="table-header-cell">
//                     <input value={h} onChange={e => updateHeader(i, e.target.value)} placeholder={`Col ${i + 1}`} />
//                     <button className="table-cell-del" onClick={() => removeColumn(i)} title="Remove column">×</button>
//                   </div>
//                 </th>
//               ))}
//               <th><button className="table-add-col" onClick={addColumn}>+ Col</button></th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, ri) => (
//               <tr key={ri}>
//                 {row.map((cell, ci) => (
//                   <td key={ci}><input value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder="—" /></td>
//                 ))}
//                 <td><button className="table-cell-del" onClick={() => removeRow(ri)} title="Remove row">×</button></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <button className="btn btn-ghost table-add-row" onClick={addRow} style={{ fontSize: 13, marginTop: 8 }}>
//         + Add Row
//       </button>
//     </div>
//   );
// }

// // ── Block wrapper card ────────────────────────────────────────
// function BlockEditor({ block, index, total, onChange, onRemove, onMove }) {
//   const [collapsed, setCollapsed] = useState(false);

//   const renderEditor = () => {
//     switch (block.type) {
//       case 'text':  return <TextBlockEditor  block={block} onChange={onChange} />;
//       case 'code':  return <CodeBlockEditor  block={block} onChange={onChange} />;
//       case 'image': return <ImageBlockEditor block={block} onChange={onChange} />;
//       case 'video': return <VideoBlockEditor block={block} onChange={onChange} />;
//       case 'table': return <TableBlockEditor block={block} onChange={onChange} />;
//       default:      return null;
//     }
//   };

//   return (
//     <div className="block-editor-card">
//       <div className="block-editor-header">
//         <div className="block-editor-header-left">
//           <span className="block-type-icon" style={{ color: BLOCK_COLORS[block.type] }}>{BLOCK_ICONS[block.type]}</span>
//           <span className="block-type-name" style={{ color: BLOCK_COLORS[block.type] }}>{block.type.toUpperCase()}</span>
//           <span className="block-index">Block {index + 1}</span>
//         </div>
//         <div className="block-editor-actions">
//           <button className="block-action-btn" onClick={() => onMove(index, -1)} disabled={index === 0}         title="Move up">↑</button>
//           <button className="block-action-btn" onClick={() => onMove(index, 1)}  disabled={index === total - 1} title="Move down">↓</button>
//           <button className="block-action-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '⊕' : '⊖'}</button>
//           <button className="block-action-btn danger" onClick={onRemove} title="Remove block">✕</button>
//         </div>
//       </div>
//       {!collapsed && renderEditor()}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN EDITOR
// // ─────────────────────────────────────────────────────────────
// export default function AdminAnalysisEditor() {
//   const { id }   = useParams();
//   const navigate = useNavigate();
//   const isEdit   = Boolean(id);

//   const [categories,     setCategories]     = useState([]);
//   const [saving,         setSaving]         = useState(false);
//   const [loading,        setLoading]        = useState(isEdit);
//   const [showNbImporter, setShowNbImporter] = useState(false);

//   const [meta, setMeta] = useState({
//     title: '', slug: '', summary: '',
//     category: '', difficulty: 'Intermediate',
//     tags: '', published: false,
//   });
//   const [blocks, setBlocks] = useState([NEW_BLOCK.text(), NEW_BLOCK.code()]);

//   useEffect(() => {
//     api.get('/categories')
//       .then(r => setCategories(r.data))
//       .catch(() => toast.error('Failed to load categories'));
//   }, []);

//   useEffect(() => {
//     if (!isEdit) return;
//     api.get(`/analyses/id/${id}`)
//       .then(({ data: a }) => {
//         setMeta({
//           title:      a.title      || '',
//           slug:       a.slug       || '',
//           summary:    a.summary    || '',
//           category:   a.category?._id || a.category || '',
//           difficulty: a.difficulty || 'Intermediate',
//           tags:       (a.tags || []).join(', '),
//           published:  a.published  || false,
//         });
//         const sorted = [...(a.contentBlocks || [])].sort((x, y) => x.order - y.order);
//         setBlocks(sorted.length ? sorted : [NEW_BLOCK.text(), NEW_BLOCK.code()]);
//       })
//       .catch(() => toast.error('Failed to load analysis'))
//       .finally(() => setLoading(false));
//   }, [id, isEdit]);

//   const handleTitleChange = (title) => {
//     const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
//     setMeta(m => ({ ...m, title, slug }));
//   };

//   const addBlock    = (type)           => setBlocks(b => [...b, NEW_BLOCK[type]()]);
//   const updateBlock = (index, changes) => setBlocks(b => b.map((bl, i) => i === index ? { ...bl, ...changes } : bl));
//   const removeBlock = (index) => {
//     if (blocks.length <= 1) { toast.warning('At least one block required'); return; }
//     setBlocks(b => b.filter((_, i) => i !== index));
//   };
//   const moveBlock = (index, dir) => {
//     const nb = [...blocks];
//     const t  = index + dir;
//     if (t < 0 || t >= nb.length) return;
//     [nb[index], nb[t]] = [nb[t], nb[index]];
//     setBlocks(nb);
//   };

//   // Append imported notebook blocks after existing ones
//   const handleNotebookImport = (importedBlocks) => {
//     setBlocks(prev => [...prev, ...importedBlocks]);
//     toast.success(`Imported ${importedBlocks.length} block${importedBlocks.length !== 1 ? 's' : ''} from notebook`);
//   };

//   const handleSave = async (publishState) => {
//     if (!meta.title.trim())   { toast.error('Title is required');        return; }
//     if (!meta.category)       { toast.error('Please select a category'); return; }
//     if (!meta.summary.trim()) { toast.error('Summary is required');      return; }

//     const payload = {
//       title:         meta.title.trim(),
//       slug:          meta.slug,
//       summary:       meta.summary.trim(),
//       category:      meta.category,
//       difficulty:    meta.difficulty,
//       tags:          meta.tags.split(',').map(t => t.trim()).filter(Boolean),
//       published:     publishState ?? meta.published,
//       contentBlocks: blocks.map((b, i) => ({ ...b, order: i })),
//     };

//     setSaving(true);
//     try {
//       if (isEdit) {
//         await api.put(`/analyses/${id}`, payload);
//         toast.success('Analysis updated!');
//       } else {
//         await api.post('/analyses', payload);
//         toast.success('Analysis created!');
//         navigate('/admin/analyses');
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//     setSaving(false);
//   };

//   if (loading) return (
//     <AdminLayout title="Loading...">
//       <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Fetching analysis content…</p>
//     </AdminLayout>
//   );

//   return (
//     <AdminLayout title={isEdit ? 'Edit Analysis' : 'New Analysis'}>
//       {/* Notebook import modal (portal-style, rendered at top level) */}
//       {showNbImporter && (
//         <NotebookImportModal
//           onImport={handleNotebookImport}
//           onClose={() => setShowNbImporter(false)}
//         />
//       )}

//       <div className="editor-layout">

//         {/* ── LEFT META PANEL ── */}
//         <div className="editor-meta-panel">
//           <div className="editor-panel-card">
//             <h3 className="editor-panel-title">Details</h3>

//             <div className="form-group">
//               <label>Title *</label>
//               <input type="text" placeholder="e.g. OLS Regression with Diagnostics"
//                 value={meta.title} onChange={e => handleTitleChange(e.target.value)} />
//             </div>

//             <div className="form-group">
//               <label>Slug</label>
//               <input type="text" value={meta.slug}
//                 onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))}
//                 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
//             </div>

//             <div className="form-group">
//               <label>Summary * <span className="field-hint-inline">({meta.summary.length}/300)</span></label>
//               <textarea rows={3} placeholder="One-paragraph description shown on cards…"
//                 value={meta.summary} maxLength={300}
//                 onChange={e => setMeta(m => ({ ...m, summary: e.target.value }))} />
//             </div>

//             <div className="form-group">
//               <label>Category *</label>
//               <select value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value }))}>
//                 <option value="">— Select category —</option>
//                 {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Difficulty</label>
//               <select value={meta.difficulty} onChange={e => setMeta(m => ({ ...m, difficulty: e.target.value }))}>
//                 <option>Beginner</option>
//                 <option>Intermediate</option>
//                 <option>Advanced</option>
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Tags <span className="field-hint-inline">(comma separated)</span></label>
//               <input type="text" placeholder="regression, ols, heteroskedasticity"
//                 value={meta.tags} onChange={e => setMeta(m => ({ ...m, tags: e.target.value }))} />
//             </div>

//             <div className="editor-actions">
//               <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
//                 {saving ? 'Saving…' : '💾 Save Draft'}
//               </button>
//               <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
//                 {saving ? '…' : '🚀 Publish'}
//               </button>
//             </div>
//           </div>

//           <div className="editor-panel-card">
//             <h3 className="editor-panel-title">Block Summary</h3>
//             <div className="block-summary-list">
//               {blocks.map((b, i) => (
//                 <div key={i} className="block-summary-item">
//                   <span style={{ color: BLOCK_COLORS[b.type], fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
//                     {BLOCK_ICONS[b.type]} {b.type}
//                   </span>
//                   <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{i + 1}</span>
//                 </div>
//               ))}
//             </div>
//             <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 10 }}>
//               {blocks.length} block{blocks.length !== 1 ? 's' : ''} total
//             </p>
//           </div>
//         </div>

//         {/* ── RIGHT BLOCKS PANEL ── */}
//         <div className="editor-blocks-panel">
//           <div className="blocks-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
//             <div>
//               <h3 className="editor-panel-title" style={{ margin: 0 }}>Content Blocks</h3>
//               <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
//                 Add, reorder, and edit blocks. Code + Text are required.
//               </p>
//             </div>
//             {/* Notebook import trigger */}
//             <button
//               onClick={() => setShowNbImporter(true)}
//               style={{
//                 fontSize: 12, fontWeight: 600,
//                 padding: '7px 14px', borderRadius: 8,
//                 border: '1.5px solid #f59e0b',
//                 background: 'rgba(245,158,11,0.07)',
//                 color: '#b45309', cursor: 'pointer',
//                 fontFamily: 'DM Sans, system-ui, sans-serif',
//                 display: 'inline-flex', alignItems: 'center', gap: 6,
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               📓 Import from Jupyter notebook
//             </button>
//           </div>

//           <div className="blocks-list">
//             {blocks.map((block, i) => (
//               <BlockEditor
//                 key={i}
//                 block={block}
//                 index={i}
//                 total={blocks.length}
//                 onChange={changes => updateBlock(i, changes)}
//                 onRemove={() => removeBlock(i)}
//                 onMove={moveBlock}
//               />
//             ))}
//           </div>

//           <div className="add-block-toolbar">
//             <span className="add-block-label">Add block:</span>
//             {Object.keys(NEW_BLOCK).map(type => (
//               <button key={type} className="add-block-btn" onClick={() => addBlock(type)}
//                 style={{ '--block-color': BLOCK_COLORS[type] }}>
//                 <span>{BLOCK_ICONS[type]}</span> {type}
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>
//     </AdminLayout>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './AdminAnalysisEditor.css';

// ── Default empty blocks ──────────────────────────────────────
const NEW_BLOCK = {
  text:  () => ({ type: 'text',  order: 0, textContent: '' }),
  code:  () => ({ type: 'code',  order: 0, codeContent: '', codeLanguage: 'python', codeTitle: '' }),
  image: () => ({ type: 'image', order: 0, imageUrl: '', imageCaption: '' }),
  video: () => ({ type: 'video', order: 0, videoUrl: '', videoTitle: '' }),
  table: () => ({ type: 'table', order: 0, tableHeaders: ['Column 1', 'Column 2'], tableRows: [['', '']] }),
};

const BLOCK_ICONS  = { text: '¶', code: '{ }', image: '◻', video: '▶', table: '⊟' };
const BLOCK_COLORS = {
  text:  '#0891b2',
  code:  '#5cc1d0',
  image: '#9333ea',
  video: '#ea580c',
  table: '#f59e0b',
};

// ── Text ─────────────────────────────────────────────────────
function TextBlockEditor({ block, onChange }) {
  return (
    <div className="block-editor-body">
      <textarea
        rows={6}
        placeholder="Write your explanation here. Use blank lines to separate paragraphs."
        value={block.textContent || ''}
        onChange={e => onChange({ textContent: e.target.value })}
      />
    </div>
  );
}

// ── Code ─────────────────────────────────────────────────────
function CodeBlockEditor({ block, onChange }) {
  return (
    <div className="block-editor-body">
      <div className="block-editor-row">
        <div className="form-col">
          <label>Code Title (optional)</label>
          <input type="text" placeholder="e.g. OLS Regression Example"
            value={block.codeTitle || ''} onChange={e => onChange({ codeTitle: e.target.value })} />
        </div>
        <div className="form-col" style={{ maxWidth: 160 }}>
          <label>Language</label>
          <select value={block.codeLanguage || 'python'} onChange={e => onChange({ codeLanguage: e.target.value })}>
            <option value="python">Python</option>
            <option value="r">R</option>
            <option value="bash">Bash</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      <textarea
        rows={12}
        className="code-textarea"
        placeholder={'# Paste your Python code here\nimport pandas as pd\n...'}
        value={block.codeContent || ''}
        onChange={e => onChange({ codeContent: e.target.value })}
        spellCheck={false}
      />
    </div>
  );
}

// ── Image (with uploader) ─────────────────────────────────────
function ImageBlockEditor({ block, onChange }) {
  const [showPicker, setShowPicker] = useState(!block.imageUrl);

  const handleSelect = (url) => {
    onChange({ imageUrl: url });
    setShowPicker(false);
  };

  return (
    <div className="block-editor-body">
      {block.imageUrl && !showPicker && (
        <div className="current-media-preview">
          <img src={block.imageUrl} alt="selected" className="current-media-img" />
          <div className="current-media-actions">
            <span className="current-media-url" title={block.imageUrl}>{block.imageUrl}</span>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
              onClick={() => setShowPicker(true)}>
              ✎ Change
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="media-picker-section">
          <div className="media-picker-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select an image</span>
            {block.imageUrl && (
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => setShowPicker(false)}>Cancel</button>
            )}
          </div>
          <ImageUploader currentUrl={block.imageUrl} onSelect={handleSelect} />
        </div>
      )}

      <div className="form-col">
        <label>Caption <span className="field-hint-inline">(optional)</span></label>
        <input type="text" placeholder="Figure 1: Residuals vs Fitted values"
          value={block.imageCaption || ''} onChange={e => onChange({ imageCaption: e.target.value })} />
      </div>
    </div>
  );
}

// ── Video (with uploader) ─────────────────────────────────────
function VideoBlockEditor({ block, onChange }) {
  const [showPicker, setShowPicker] = useState(!block.videoUrl);

  const getYouTubeThumbnail = (url) => {
    const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
  };

  const isYT    = Boolean(block.videoUrl && getYouTubeThumbnail(block.videoUrl));
  const ytThumb = isYT ? getYouTubeThumbnail(block.videoUrl) : null;

  const handleSelect = (url) => {
    onChange({ videoUrl: url });
    setShowPicker(false);
  };

  return (
    <div className="block-editor-body">
      {block.videoUrl && !showPicker && (
        <div className="current-media-preview">
          {isYT ? (
            <img src={ytThumb} alt="YouTube thumbnail" className="current-media-img" />
          ) : (
            <video src={block.videoUrl} controls muted className="current-media-video" />
          )}
          <div className="current-media-actions">
            <span className="current-media-url" title={block.videoUrl}>{block.videoUrl}</span>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
              onClick={() => setShowPicker(true)}>
              ✎ Change
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="media-picker-section">
          <div className="media-picker-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select a video</span>
            {block.videoUrl && (
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => setShowPicker(false)}>Cancel</button>
            )}
          </div>
          <VideoUploader currentUrl={block.videoUrl} onSelect={handleSelect} />
        </div>
      )}

      <div className="form-col">
        <label>Video Title <span className="field-hint-inline">(optional)</span></label>
        <input type="text" placeholder="e.g. Visualizing Regression Coefficients"
          value={block.videoTitle || ''} onChange={e => onChange({ videoTitle: e.target.value })} />
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────

/**
 * Tries to parse an HTML string that may contain a <table>.
 * Returns { headers, rows } if successful, null otherwise.
 * Handles Jupyter notebook output tables (pandas DataFrame HTML).
 */
function parseHtmlTable(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return null;

    // Collect all <tr> elements
    const allRows = Array.from(table.querySelectorAll('tr'));
    if (allRows.length === 0) return null;

    const getCellText = (cell) => cell.textContent.trim();

    // Jupyter DataFrames often have <thead> with <th> for headers.
    // Fall back to using the first <tr> as the header row.
    let headerRow = null;
    let dataRows  = [];

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (thead) {
      // Use the LAST row in thead as the header (Jupyter sometimes has multi-row headers;
      // the last row has the actual column names).
      const theadRows = Array.from(thead.querySelectorAll('tr'));
      headerRow = theadRows[theadRows.length - 1];
      dataRows  = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
    } else {
      // No explicit thead — treat the first row as headers
      headerRow = allRows[0];
      dataRows  = allRows.slice(1);
    }

    // Extract header cell text. Jupyter uses <th> for both index and column headers.
    // Skip the very first <th> in the header row if it is blank (the DataFrame index label).
    let headers = Array.from(headerRow.querySelectorAll('th, td')).map(getCellText);
    // If the first header is empty, it is the index column — keep it as "#" for clarity.
    if (headers[0] === '') headers[0] = '#';

    if (headers.length === 0) return null;

    // Extract data rows; each may start with a <th> (the row index) followed by <td> cells.
    const rows = dataRows.map(tr => {
      const cells = Array.from(tr.querySelectorAll('th, td')).map(getCellText);
      // Pad / trim to match header count
      while (cells.length < headers.length) cells.push('');
      return cells.slice(0, headers.length);
    }).filter(r => r.some(c => c !== '')); // drop completely empty rows

    if (rows.length === 0) return null;

    return { headers, rows };
  } catch {
    return null;
  }
}

/**
 * Parses tab-separated (Excel / Google Sheets) or CSV plain text.
 * Returns { headers, rows } or null.
 */
function parsePlainTextTable(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return null;

  const isTab = lines[0].includes('\t');

  const splitRow = (line) => {
    if (isTab) return line.split('\t');
    // Basic CSV with quoted-field support
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsed  = lines.map(splitRow);
  const headers = parsed[0].map(h => h || 'Column');
  const rows    = parsed.slice(1).map(row => {
    const r = [...row];
    while (r.length < headers.length) r.push('');
    return r.slice(0, headers.length);
  });

  return { headers, rows };
}

function TableBlockEditor({ block, onChange }) {
  const headers = block.tableHeaders || ['Column 1'];
  const rows    = block.tableRows    || [['']];
  const [pasteError, setPasteError] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState('');

  const updateHeader = (i, val) => { const h = [...headers]; h[i] = val; onChange({ tableHeaders: h }); };
  const updateCell   = (r, c, val) => {
    const newRows = rows.map(row => [...row]);
    newRows[r][c] = val;
    onChange({ tableRows: newRows });
  };
  const addColumn    = () => onChange({
    tableHeaders: [...headers, `Column ${headers.length + 1}`],
    tableRows: rows.map(r => [...r, ''])
  });
  const removeColumn = (ci) => {
    if (headers.length <= 1) return;
    onChange({
      tableHeaders: headers.filter((_, i) => i !== ci),
      tableRows: rows.map(r => r.filter((_, i) => i !== ci))
    });
  };
  const addRow    = () => onChange({ tableRows: [...rows, headers.map(() => '')] });
  const removeRow = (ri) => {
    if (rows.length <= 1) return;
    onChange({ tableRows: rows.filter((_, i) => i !== ri) });
  };

  const applyParsed = ({ headers: newHeaders, rows: newRows }) => {
    onChange({ tableHeaders: newHeaders, tableRows: newRows });
    setPasteSuccess(`Imported ${newHeaders.length} columns × ${newRows.length} rows`);
    setTimeout(() => setPasteSuccess(''), 3000);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setPasteError('');
    setPasteSuccess('');

    // ── 1. Try HTML first (Jupyter notebook tables, rich copies from browsers) ──
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData) {
      const parsed = parseHtmlTable(htmlData);
      if (parsed) {
        applyParsed(parsed);
        return;
      }
    }

    // ── 2. Fall back to plain text (Excel, Google Sheets, CSV) ──
    const plainText = e.clipboardData.getData('text/plain');
    if (plainText?.trim()) {
      const parsed = parsePlainTextTable(plainText);
      if (parsed) {
        applyParsed(parsed);
        return;
      }
    }

    // ── 3. Nothing worked ──
    setPasteError(
      'Could not detect a table. Copy a table selection from Excel, Google Sheets, or a Jupyter notebook output (select only the table output, not the whole notebook).'
    );
  };

  return (
    <div className="block-editor-body">

      {/* ── Paste zone ── */}
      <div
        onPaste={handlePaste}
        tabIndex={0}
        style={{
          border: `1.5px dashed ${pasteSuccess ? '#38a169' : '#5cc1d0'}`,
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 12,
          background: pasteSuccess
            ? 'rgba(56,161,105,0.07)'
            : 'rgba(92,193,208,0.05)',
          cursor: 'text',
          outline: 'none',
          fontSize: 13,
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onFocus={e => {
          if (!pasteSuccess) e.currentTarget.style.background = 'rgba(92,193,208,0.12)';
        }}
        onBlur={e => {
          if (!pasteSuccess) e.currentTarget.style.background = 'rgba(92,193,208,0.05)';
        }}
      >
        {pasteSuccess ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38a169', fontWeight: 600 }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <span>{pasteSuccess}</span>
            <span style={{ fontWeight: 400, color: '#68a885', fontSize: 12, marginLeft: 4 }}>
              — Edit cells below or paste again to replace
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#5cc1d0' }}>
            <span style={{ fontSize: 18 }}>⊟</span>
            <div>
              <span style={{ fontWeight: 600 }}>Click here, then paste</span>
              <span style={{ color: '#4a5568', marginLeft: 6 }}>your table from:</span>
              <span style={{ color: '#8898aa', marginLeft: 8, fontSize: 12 }}>
                Excel · Google Sheets · Jupyter notebook output
              </span>
              <span style={{ color: '#b0bec5', marginLeft: 10, fontSize: 12 }}>Ctrl+V / Cmd+V</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Jupyter note ── */}
      <div style={{
        fontSize: 11,
        color: '#8898aa',
        marginBottom: 12,
        padding: '6px 10px',
        background: 'rgba(245,158,11,0.06)',
        borderLeft: '3px solid #f59e0b',
        borderRadius: '0 6px 6px 0',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: '#b7791f' }}>Jupyter tip:</strong> In your notebook, click the table output cell to select it,
        then select all its text (Ctrl+A inside the output) and copy — <em>do not copy the entire notebook page</em>.
        Pandas DataFrames with row-index columns are supported.
      </div>

      {/* ── Error ── */}
      {pasteError && (
        <div style={{
          color: '#c53030',
          fontSize: 12,
          marginBottom: 12,
          padding: '8px 12px',
          background: 'rgba(229,62,62,0.08)',
          border: '1px solid rgba(229,62,62,0.2)',
          borderRadius: 8,
          lineHeight: 1.5,
        }}>
          {pasteError}
        </div>
      )}

      {/* ── Manual table editor ── */}
      <div className="table-editor-scroll">
        <table className="table-editor">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>
                  <div className="table-header-cell">
                    <input value={h} onChange={e => updateHeader(i, e.target.value)} placeholder={`Col ${i + 1}`} />
                    <button className="table-cell-del" onClick={() => removeColumn(i)} title="Remove column">×</button>
                  </div>
                </th>
              ))}
              <th><button className="table-add-col" onClick={addColumn}>+ Col</button></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    <input value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder="—" />
                  </td>
                ))}
                <td>
                  <button className="table-cell-del" onClick={() => removeRow(ri)} title="Remove row">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="btn btn-ghost table-add-row"
        onClick={addRow}
        style={{ fontSize: 13, marginTop: 8 }}
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Block wrapper card ────────────────────────────────────────
function BlockEditor({ block, index, total, onChange, onRemove, onMove }) {
  const [collapsed, setCollapsed] = useState(false);

  const renderEditor = () => {
    switch (block.type) {
      case 'text':  return <TextBlockEditor  block={block} onChange={onChange} />;
      case 'code':  return <CodeBlockEditor  block={block} onChange={onChange} />;
      case 'image': return <ImageBlockEditor block={block} onChange={onChange} />;
      case 'video': return <VideoBlockEditor block={block} onChange={onChange} />;
      case 'table': return <TableBlockEditor block={block} onChange={onChange} />;
      default:      return null;
    }
  };

  return (
    <div className="block-editor-card">
      <div className="block-editor-header">
        <div className="block-editor-header-left">
          <span className="block-type-icon" style={{ color: BLOCK_COLORS[block.type] }}>{BLOCK_ICONS[block.type]}</span>
          <span className="block-type-name" style={{ color: BLOCK_COLORS[block.type] }}>{block.type.toUpperCase()}</span>
          <span className="block-index">Block {index + 1}</span>
        </div>
        <div className="block-editor-actions">
          <button className="block-action-btn" onClick={() => onMove(index, -1)} disabled={index === 0}         title="Move up">↑</button>
          <button className="block-action-btn" onClick={() => onMove(index, 1)}  disabled={index === total - 1} title="Move down">↓</button>
          <button className="block-action-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '⊕' : '⊖'}</button>
          <button className="block-action-btn danger" onClick={onRemove} title="Remove block">✕</button>
        </div>
      </div>
      {!collapsed && renderEditor()}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────
export default function AdminAnalysisEditor() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(isEdit);

  const [meta, setMeta] = useState({
    title: '', slug: '', summary: '',
    category: '', difficulty: 'Intermediate',
    tags: '', published: false
  });
  const [blocks, setBlocks] = useState([NEW_BLOCK.text(), NEW_BLOCK.code()]);

  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/analyses/id/${id}`)
      .then(({ data: a }) => {
        setMeta({
          title:      a.title      || '',
          slug:       a.slug       || '',
          summary:    a.summary    || '',
          category:   a.category?._id || a.category || '',
          difficulty: a.difficulty || 'Intermediate',
          tags:       (a.tags || []).join(', '),
          published:  a.published  || false,
        });
        const sorted = [...(a.contentBlocks || [])].sort((x, y) => x.order - y.order);
        setBlocks(sorted.length ? sorted : [NEW_BLOCK.text(), NEW_BLOCK.code()]);
      })
      .catch(() => toast.error('Failed to load analysis'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleTitleChange = (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setMeta(m => ({ ...m, title, slug }));
  };

  const addBlock    = (type)           => setBlocks(b => [...b, NEW_BLOCK[type]()]);
  const updateBlock = (index, changes) => setBlocks(b => b.map((bl, i) => i === index ? { ...bl, ...changes } : bl));
  const removeBlock = (index) => {
    if (blocks.length <= 1) { toast.warning('At least one block required'); return; }
    setBlocks(b => b.filter((_, i) => i !== index));
  };
  const moveBlock = (index, dir) => {
    const nb = [...blocks];
    const t  = index + dir;
    if (t < 0 || t >= nb.length) return;
    [nb[index], nb[t]] = [nb[t], nb[index]];
    setBlocks(nb);
  };

  const handleSave = async (publishState) => {
    if (!meta.title.trim())   { toast.error('Title is required');        return; }
    if (!meta.category)       { toast.error('Please select a category'); return; }
    if (!meta.summary.trim()) { toast.error('Summary is required');      return; }

    const payload = {
      title:         meta.title.trim(),
      slug:          meta.slug,
      summary:       meta.summary.trim(),
      category:      meta.category,
      difficulty:    meta.difficulty,
      tags:          meta.tags.split(',').map(t => t.trim()).filter(Boolean),
      published:     publishState ?? meta.published,
      contentBlocks: blocks.map((b, i) => ({ ...b, order: i })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/analyses/${id}`, payload);
        toast.success('Analysis updated!');
      } else {
        await api.post('/analyses', payload);
        toast.success('Analysis created!');
        navigate('/admin/analyses');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) return (
    <AdminLayout title="Loading...">
      <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Fetching analysis content...</p>
    </AdminLayout>
  );

  return (
    <AdminLayout title={isEdit ? 'Edit Analysis' : 'New Analysis'}>
      <div className="editor-layout">

        {/* ── LEFT META PANEL ── */}
        <div className="editor-meta-panel">
          <div className="editor-panel-card">
            <h3 className="editor-panel-title">Details</h3>

            <div className="form-group">
              <label>Title *</label>
              <input type="text" placeholder="e.g. OLS Regression with Diagnostics"
                value={meta.title} onChange={e => handleTitleChange(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Slug</label>
              <input type="text" value={meta.slug}
                onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
            </div>

            <div className="form-group">
              <label>Summary * <span className="field-hint-inline">({meta.summary.length}/300)</span></label>
              <textarea rows={3} placeholder="One-paragraph description shown on cards..."
                value={meta.summary} maxLength={300}
                onChange={e => setMeta(m => ({ ...m, summary: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value }))}>
                <option value="">— Select category —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={meta.difficulty} onChange={e => setMeta(m => ({ ...m, difficulty: e.target.value }))}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags <span className="field-hint-inline">(comma separated)</span></label>
              <input type="text" placeholder="regression, ols, heteroskedasticity"
                value={meta.tags} onChange={e => setMeta(m => ({ ...m, tags: e.target.value }))} />
            </div>

            <div className="editor-actions">
              <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Draft'}
              </button>
              <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? '...' : '🚀 Publish'}
              </button>
            </div>
          </div>

          <div className="editor-panel-card">
            <h3 className="editor-panel-title">Block Summary</h3>
            <div className="block-summary-list">
              {blocks.map((b, i) => (
                <div key={i} className="block-summary-item">
                  <span style={{ color: BLOCK_COLORS[b.type], fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {BLOCK_ICONS[b.type]} {b.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{i + 1}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 10 }}>
              {blocks.length} block{blocks.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* ── RIGHT BLOCKS PANEL ── */}
        <div className="editor-blocks-panel">
          <div className="blocks-header">
            <h3 className="editor-panel-title" style={{ margin: 0 }}>Content Blocks</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Add, reorder, and edit blocks. Code + Text are required.
            </p>
          </div>

          <div className="blocks-list">
            {blocks.map((block, i) => (
              <BlockEditor
                key={i}
                block={block}
                index={i}
                total={blocks.length}
                onChange={changes => updateBlock(i, changes)}
                onRemove={() => removeBlock(i)}
                onMove={moveBlock}
              />
            ))}
          </div>

          <div className="add-block-toolbar">
            <span className="add-block-label">Add block:</span>
            {Object.keys(NEW_BLOCK).map(type => (
              <button key={type} className="add-block-btn" onClick={() => addBlock(type)}
                style={{ '--block-color': BLOCK_COLORS[type] }}>
                <span>{BLOCK_ICONS[type]}</span> {type}
              </button>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import AdminLayout from './AdminLayout';
// import ImageUploader from './ImageUploader';
// import VideoUploader from './VideoUploader';
// import api from '../../utils/api';
// import { toast } from 'react-toastify';
// import './AdminAnalysisEditor.css';

// // ── Default empty blocks ──────────────────────────────────────
// const NEW_BLOCK = {
//   text:  () => ({ type: 'text',  order: 0, textContent: '' }),
//   code:  () => ({ type: 'code',  order: 0, codeContent: '', codeLanguage: 'python', codeTitle: '' }),
//   image: () => ({ type: 'image', order: 0, imageUrl: '', imageCaption: '' }),
//   video: () => ({ type: 'video', order: 0, videoUrl: '', videoTitle: '' }),
//   table: () => ({ type: 'table', order: 0, tableHeaders: ['Column 1', 'Column 2'], tableRows: [['', '']] }),
// };

// const BLOCK_ICONS  = { text: '¶', code: '{ }', image: '◻', video: '▶', table: '⊟' };
// const BLOCK_COLORS = {
//   text:  '#0891b2',   // teal-blue
//   code:  '#5cc1d0',   // teal
//   image: '#9333ea',   // purple
//   video: '#ea580c',   // orange
//   table: '#f59e0b',   // amber
// };

// // ── Text ─────────────────────────────────────────────────────
// function TextBlockEditor({ block, onChange }) {
//   return (
//     <div className="block-editor-body">
//       <textarea
//         rows={6}
//         placeholder="Write your explanation here. Use blank lines to separate paragraphs."
//         value={block.textContent || ''}
//         onChange={e => onChange({ textContent: e.target.value })}
//       />
//     </div>
//   );
// }

// // ── Code ─────────────────────────────────────────────────────
// function CodeBlockEditor({ block, onChange }) {
//   return (
//     <div className="block-editor-body">
//       <div className="block-editor-row">
//         <div className="form-col">
//           <label>Code Title (optional)</label>
//           <input type="text" placeholder="e.g. OLS Regression Example"
//             value={block.codeTitle || ''} onChange={e => onChange({ codeTitle: e.target.value })} />
//         </div>
//         <div className="form-col" style={{ maxWidth: 160 }}>
//           <label>Language</label>
//           <select value={block.codeLanguage || 'python'} onChange={e => onChange({ codeLanguage: e.target.value })}>
//             <option value="python">Python</option>
//             <option value="r">R</option>
//             <option value="bash">Bash</option>
//             <option value="sql">SQL</option>
//             <option value="json">JSON</option>
//           </select>
//         </div>
//       </div>
//       <textarea
//         rows={12}
//         className="code-textarea"
//         placeholder={'# Paste your Python code here\nimport pandas as pd\n...'}
//         value={block.codeContent || ''}
//         onChange={e => onChange({ codeContent: e.target.value })}
//         spellCheck={false}
//       />
//     </div>
//   );
// }

// // ── Image (with uploader) ─────────────────────────────────────
// function ImageBlockEditor({ block, onChange }) {
//   const [showPicker, setShowPicker] = useState(!block.imageUrl);

//   const handleSelect = (url) => {
//     onChange({ imageUrl: url });
//     setShowPicker(false);
//   };

//   return (
//     <div className="block-editor-body">
//       {/* Current image preview */}
//       {block.imageUrl && !showPicker && (
//         <div className="current-media-preview">
//           <img src={block.imageUrl} alt="selected" className="current-media-img" />
//           <div className="current-media-actions">
//             <span className="current-media-url" title={block.imageUrl}>{block.imageUrl}</span>
//             <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
//               onClick={() => setShowPicker(true)}>
//               ✎ Change
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Picker */}
//       {showPicker && (
//         <div className="media-picker-section">
//           <div className="media-picker-header">
//             <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select an image</span>
//             {block.imageUrl && (
//               <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
//                 onClick={() => setShowPicker(false)}>Cancel</button>
//             )}
//           </div>
//           <ImageUploader currentUrl={block.imageUrl} onSelect={handleSelect} />
//         </div>
//       )}

//       <div className="form-col">
//         <label>Caption <span className="field-hint-inline">(optional)</span></label>
//         <input type="text" placeholder="Figure 1: Residuals vs Fitted values"
//           value={block.imageCaption || ''} onChange={e => onChange({ imageCaption: e.target.value })} />
//       </div>
//     </div>
//   );
// }

// // ── Video (with uploader) ─────────────────────────────────────
// function VideoBlockEditor({ block, onChange }) {
//   const [showPicker, setShowPicker] = useState(!block.videoUrl);

//   const getYouTubeThumbnail = (url) => {
//     const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
//     return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
//   };

//   const isYT       = Boolean(block.videoUrl && getYouTubeThumbnail(block.videoUrl));
//   const ytThumb    = isYT ? getYouTubeThumbnail(block.videoUrl) : null;

//   const handleSelect = (url) => {
//     onChange({ videoUrl: url });
//     setShowPicker(false);
//   };

//   return (
//     <div className="block-editor-body">
//       {/* Current video preview */}
//       {block.videoUrl && !showPicker && (
//         <div className="current-media-preview">
//           {isYT ? (
//             <img src={ytThumb} alt="YouTube thumbnail" className="current-media-img" />
//           ) : (
//             <video src={block.videoUrl} controls muted className="current-media-video" />
//           )}
//           <div className="current-media-actions">
//             <span className="current-media-url" title={block.videoUrl}>{block.videoUrl}</span>
//             <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px', flexShrink: 0 }}
//               onClick={() => setShowPicker(true)}>
//               ✎ Change
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Picker */}
//       {showPicker && (
//         <div className="media-picker-section">
//           <div className="media-picker-header">
//             <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select a video</span>
//             {block.videoUrl && (
//               <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}
//                 onClick={() => setShowPicker(false)}>Cancel</button>
//             )}
//           </div>
//           <VideoUploader currentUrl={block.videoUrl} onSelect={handleSelect} />
//         </div>
//       )}

//       <div className="form-col">
//         <label>Video Title <span className="field-hint-inline">(optional)</span></label>
//         <input type="text" placeholder="e.g. Visualizing Regression Coefficients"
//           value={block.videoTitle || ''} onChange={e => onChange({ videoTitle: e.target.value })} />
//       </div>
//     </div>
//   );
// }

// // ── Table ─────────────────────────────────────────────────────
// function TableBlockEditor({ block, onChange }) {
//   const headers = block.tableHeaders || ['Column 1'];
//   const rows    = block.tableRows    || [['']];

//   const updateHeader = (i, val) => { const h = [...headers]; h[i] = val; onChange({ tableHeaders: h }); };
//   const updateCell   = (r, c, val) => {
//     const newRows = rows.map(row => [...row]); newRows[r][c] = val; onChange({ tableRows: newRows });
//   };
//   const addColumn    = () => onChange({ tableHeaders: [...headers, `Column ${headers.length + 1}`], tableRows: rows.map(r => [...r, '']) });
//   const removeColumn = (ci) => {
//     if (headers.length <= 1) return;
//     onChange({ tableHeaders: headers.filter((_, i) => i !== ci), tableRows: rows.map(r => r.filter((_, i) => i !== ci)) });
//   };
//   const addRow       = () => onChange({ tableRows: [...rows, headers.map(() => '')] });
//   const removeRow    = (ri) => { if (rows.length <= 1) return; onChange({ tableRows: rows.filter((_, i) => i !== ri) }); };

//   return (
//     <div className="block-editor-body">
//       <div className="table-editor-scroll">
//         <table className="table-editor">
//           <thead>
//             <tr>
//               {headers.map((h, i) => (
//                 <th key={i}>
//                   <div className="table-header-cell">
//                     <input value={h} onChange={e => updateHeader(i, e.target.value)} placeholder={`Col ${i+1}`} />
//                     <button className="table-cell-del" onClick={() => removeColumn(i)} title="Remove column">×</button>
//                   </div>
//                 </th>
//               ))}
//               <th><button className="table-add-col" onClick={addColumn}>+ Col</button></th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, ri) => (
//               <tr key={ri}>
//                 {row.map((cell, ci) => (
//                   <td key={ci}><input value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder="—" /></td>
//                 ))}
//                 <td><button className="table-cell-del" onClick={() => removeRow(ri)} title="Remove row">×</button></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <button className="btn btn-ghost table-add-row" onClick={addRow} style={{ fontSize: 13, marginTop: 8 }}>+ Add Row</button>
//     </div>
//   );
// }

// // ── Block wrapper card ────────────────────────────────────────
// function BlockEditor({ block, index, total, onChange, onRemove, onMove }) {
//   const [collapsed, setCollapsed] = useState(false);

//   const renderEditor = () => {
//     switch (block.type) {
//       case 'text':  return <TextBlockEditor  block={block} onChange={onChange} />;
//       case 'code':  return <CodeBlockEditor  block={block} onChange={onChange} />;
//       case 'image': return <ImageBlockEditor block={block} onChange={onChange} />;
//       case 'video': return <VideoBlockEditor block={block} onChange={onChange} />;
//       case 'table': return <TableBlockEditor block={block} onChange={onChange} />;
//       default:      return null;
//     }
//   };

//   return (
//     <div className="block-editor-card">
//       <div className="block-editor-header">
//         <div className="block-editor-header-left">
//           <span className="block-type-icon" style={{ color: BLOCK_COLORS[block.type] }}>{BLOCK_ICONS[block.type]}</span>
//           <span className="block-type-name" style={{ color: BLOCK_COLORS[block.type] }}>{block.type.toUpperCase()}</span>
//           <span className="block-index">Block {index + 1}</span>
//         </div>
//         <div className="block-editor-actions">
//           <button className="block-action-btn" onClick={() => onMove(index, -1)} disabled={index === 0}         title="Move up">↑</button>
//           <button className="block-action-btn" onClick={() => onMove(index, 1)}  disabled={index === total - 1} title="Move down">↓</button>
//           <button className="block-action-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '⊕' : '⊖'}</button>
//           <button className="block-action-btn danger" onClick={onRemove} title="Remove block">✕</button>
//         </div>
//       </div>
//       {!collapsed && renderEditor()}
//     </div>
//   );
// }

// // ── Main Editor ───────────────────────────────────────────────
// export default function AdminAnalysisEditor() {
//   const { id }   = useParams();
//   const navigate = useNavigate();
//   const isEdit   = Boolean(id);

//   const [categories, setCategories] = useState([]);
//   const [saving,     setSaving]     = useState(false);
//   const [loading,    setLoading]    = useState(isEdit);

//   const [meta, setMeta] = useState({
//     title: '', slug: '', summary: '',
//     category: '', difficulty: 'Intermediate',
//     tags: '', published: false
//   });
//   const [blocks, setBlocks] = useState([NEW_BLOCK.text(), NEW_BLOCK.code()]);

//   useEffect(() => {
//     api.get('/categories')
//       .then(r => setCategories(r.data))
//       .catch(() => toast.error('Failed to load categories'));
//   }, []);

//   // ── FIXED: fetch by MongoDB ID via dedicated admin route ──
//   useEffect(() => {
//     if (!isEdit) return;
//     api.get(`/analyses/id/${id}`)          // hits GET /api/analyses/id/:id — no published filter
//       .then(({ data: a }) => {
//         setMeta({
//           title:      a.title      || '',
//           slug:       a.slug       || '',
//           summary:    a.summary    || '',
//           category:   a.category?._id || a.category || '',
//           difficulty: a.difficulty || 'Intermediate',
//           tags:       (a.tags || []).join(', '),
//           published:  a.published  || false,
//         });
//         const sorted = [...(a.contentBlocks || [])].sort((x, y) => x.order - y.order);
//         setBlocks(sorted.length ? sorted : [NEW_BLOCK.text(), NEW_BLOCK.code()]);
//       })
//       .catch(() => toast.error('Failed to load analysis'))
//       .finally(() => setLoading(false));
//   }, [id, isEdit]);

//   const handleTitleChange = (title) => {
//     const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
//     setMeta(m => ({ ...m, title, slug }));
//   };

//   const addBlock    = (type)           => setBlocks(b => [...b, NEW_BLOCK[type]()]);
//   const updateBlock = (index, changes) => setBlocks(b => b.map((bl, i) => i === index ? { ...bl, ...changes } : bl));
//   const removeBlock = (index) => {
//     if (blocks.length <= 1) { toast.warning('At least one block required'); return; }
//     setBlocks(b => b.filter((_, i) => i !== index));
//   };
//   const moveBlock = (index, dir) => {
//     const nb = [...blocks]; const t = index + dir;
//     if (t < 0 || t >= nb.length) return;
//     [nb[index], nb[t]] = [nb[t], nb[index]];
//     setBlocks(nb);
//   };

//   const handleSave = async (publishState) => {
//     if (!meta.title.trim())   { toast.error('Title is required');        return; }
//     if (!meta.category)       { toast.error('Please select a category'); return; }
//     if (!meta.summary.trim()) { toast.error('Summary is required');      return; }

//     const payload = {
//       title:         meta.title.trim(),
//       slug:          meta.slug,
//       summary:       meta.summary.trim(),
//       category:      meta.category,
//       difficulty:    meta.difficulty,
//       tags:          meta.tags.split(',').map(t => t.trim()).filter(Boolean),
//       published:     publishState ?? meta.published,
//       contentBlocks: blocks.map((b, i) => ({ ...b, order: i })),
//     };

//     setSaving(true);
//     try {
//       if (isEdit) {
//         await api.put(`/analyses/${id}`, payload);
//         toast.success('Analysis updated!');
//       } else {
//         await api.post('/analyses', payload);
//         toast.success('Analysis created!');
//         navigate('/admin/analyses');
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//     setSaving(false);
//   };

//   if (loading) return (
//     <AdminLayout title="Loading...">
//       <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Fetching analysis content...</p>
//     </AdminLayout>
//   );

//   return (
//     <AdminLayout title={isEdit ? 'Edit Analysis' : 'New Analysis'}>
//       <div className="editor-layout">

//         {/* ── LEFT META PANEL ── */}
//         <div className="editor-meta-panel">
//           <div className="editor-panel-card">
//             <h3 className="editor-panel-title">Details</h3>

//             <div className="form-group">
//               <label>Title *</label>
//               <input type="text" placeholder="e.g. OLS Regression with Diagnostics"
//                 value={meta.title} onChange={e => handleTitleChange(e.target.value)} />
//             </div>

//             <div className="form-group">
//               <label>Slug</label>
//               <input type="text" value={meta.slug}
//                 onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))}
//                 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
//             </div>

//             <div className="form-group">
//               <label>Summary * <span className="field-hint-inline">({meta.summary.length}/300)</span></label>
//               <textarea rows={3} placeholder="One-paragraph description shown on cards..."
//                 value={meta.summary} maxLength={300}
//                 onChange={e => setMeta(m => ({ ...m, summary: e.target.value }))} />
//             </div>

//             <div className="form-group">
//               <label>Category *</label>
//               <select value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value }))}>
//                 <option value="">— Select category —</option>
//                 {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Difficulty</label>
//               <select value={meta.difficulty} onChange={e => setMeta(m => ({ ...m, difficulty: e.target.value }))}>
//                 <option>Beginner</option>
//                 <option>Intermediate</option>
//                 <option>Advanced</option>
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Tags <span className="field-hint-inline">(comma separated)</span></label>
//               <input type="text" placeholder="regression, ols, heteroskedasticity"
//                 value={meta.tags} onChange={e => setMeta(m => ({ ...m, tags: e.target.value }))} />
//             </div>

//             <div className="editor-actions">
//               <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
//                 {saving ? 'Saving...' : '💾 Save Draft'}
//               </button>
//               <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
//                 {saving ? '...' : '🚀 Publish'}
//               </button>
//             </div>
//           </div>

//           <div className="editor-panel-card">
//             <h3 className="editor-panel-title">Block Summary</h3>
//             <div className="block-summary-list">
//               {blocks.map((b, i) => (
//                 <div key={i} className="block-summary-item">
//                   <span style={{ color: BLOCK_COLORS[b.type], fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
//                     {BLOCK_ICONS[b.type]} {b.type}
//                   </span>
//                   <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{i + 1}</span>
//                 </div>
//               ))}
//             </div>
//             <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 10 }}>
//               {blocks.length} block{blocks.length !== 1 ? 's' : ''} total
//             </p>
//           </div>
//         </div>

//         {/* ── RIGHT BLOCKS PANEL ── */}
//         <div className="editor-blocks-panel">
//           <div className="blocks-header">
//             <h3 className="editor-panel-title" style={{ margin: 0 }}>Content Blocks</h3>
//             <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
//               Add, reorder, and edit blocks. Code + Text are required.
//             </p>
//           </div>

//           <div className="blocks-list">
//             {blocks.map((block, i) => (
//               <BlockEditor
//                 key={i}
//                 block={block}
//                 index={i}
//                 total={blocks.length}
//                 onChange={changes => updateBlock(i, changes)}
//                 onRemove={() => removeBlock(i)}
//                 onMove={moveBlock}
//               />
//             ))}
//           </div>

//           <div className="add-block-toolbar">
//             <span className="add-block-label">Add block:</span>
//             {Object.keys(NEW_BLOCK).map(type => (
//               <button key={type} className="add-block-btn" onClick={() => addBlock(type)}
//                 style={{ '--block-color': BLOCK_COLORS[type] }}>
//                 <span>{BLOCK_ICONS[type]}</span> {type}
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>
//     </AdminLayout>
//   );
// }