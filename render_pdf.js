const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function mdToHtml(md) {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^---$/gim, '<hr/>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');

  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const resultLines = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        continue;
      }
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml = '<table><thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        resultLines.push(tableHtml);
      }
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          resultLines.push('<pre><code>');
        } else {
          inCodeBlock = false;
          resultLines.push('</code></pre>');
        }
      } else if (inCodeBlock) {
        resultLines.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      } else if (line.length > 0 && !line.startsWith('<h') && !line.startsWith('<hr')) {
        resultLines.push(`<p>${line}</p>`);
      } else {
        resultLines.push(line);
      }
    }
  }

  if (inTable) {
    resultLines.push('</tbody></table>');
  }

  return resultLines.join('\n');
}

const mdPath = path.join(__dirname, 'BAO_CAO_KY_THUAT_REPORT.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');
const bodyHtml = mdToHtml(mdContent);

const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VKU Mini-Project 3 Short Technical Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 16pt;
      color: #0284c7;
      text-align: center;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-weight: 800;
    }
    h2 {
      font-size: 12.5pt;
      color: #0f172a;
      border-bottom: 1.5px solid #0284c7;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 11pt;
      color: #0369a1;
      margin-top: 10px;
      margin-bottom: 4px;
    }
    p {
      margin: 4px 0 6px 0;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    code {
      font-family: 'Consolas', monospace;
      background: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 9pt;
      color: #0369a1;
    }
    pre {
      background: #0f172a;
      color: #38bdf8;
      padding: 10px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 8.5pt;
      margin: 6px 0;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 12px 0;
    }
    a {
      color: #0284c7;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

const tempHtmlPath = path.join(__dirname, 'temp_report.html');
fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

const outputPdfPath = path.join(__dirname, 'BAO_CAO_KY_THUAT_REPORT.pdf');

console.log('Rendering PDF via Headless Edge/Chrome...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let browserPath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : null);

if (browserPath) {
  try {
    execSync(`"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`, { stdio: 'inherit' });
    if (fs.existsSync(outputPdfPath)) {
      const stats = fs.statSync(outputPdfPath);
      console.log(`✓ PDF Generated Successfully (${stats.size} bytes): ${outputPdfPath}`);
    }
  } catch (e) {
    console.error('Error generating PDF:', e.message);
  }
} else {
  console.log('No headless browser found. HTML generated at:', tempHtmlPath);
}

if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}
