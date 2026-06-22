const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'Mavet');
const files = ['Talleres.tsx', 'RegistroPublico.tsx', 'Recepcion.tsx', 'InventarioBoveda.tsx', 'Biblioteca.tsx', 'Asistencia.tsx'];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add import toast
  if (!content.includes('import toast from "react-hot-toast";')) {
    content = content.replace('import React', 'import React');
    content = 'import toast from "react-hot-toast";\n' + content;
  }

  // Remove alertInfo state
  content = content.replace(/const \[alertInfo,\s*setAlertInfo\].*?;/g, '');
  content = content.replace(/const \[showAlert,\s*setShowAlert\].*?;/g, '');

  // Remove showAlert function definitions
  content = content.replace(/const showAlert\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*setTimeout[^}]*\};/g, '');

  // Remove floating alert JSX block (this is a bit tricky, but we know the exact string usually)
  const jsxBlockRegex = /\{\s*alertInfo\.show\s*&&\s*\([\s\S]*?<\/div>\s*\)\s*\}/g;
  content = content.replace(jsxBlockRegex, '');
  
  const jsxBlockRegex2 = /\{\s*showAlert\s*&&\s*\([\s\S]*?<\/div>\s*\)\s*\}/g;
  content = content.replace(jsxBlockRegex2, '');

  // Replace showAlert calls
  // showAlert("message", "success") -> toast.success("message")
  content = content.replace(/showAlert\(([^,]+),\s*"success"\)/g, 'toast.success($1)');
  content = content.replace(/showAlert\(([^,]+),\s*'success'\)/g, 'toast.success($1)');

  // showAlert("message", "error") -> toast.error("message")
  content = content.replace(/showAlert\(([^,]+),\s*"error"\)/g, 'toast.error($1)');
  content = content.replace(/showAlert\(([^,]+),\s*'error'\)/g, 'toast.error($1)');

  // Special for RegistroPublico that might just use setShowAlert(true)
  content = content.replace(/setShowAlert\(true\);?\s*setTimeout\([^)]+\);?/g, 'toast.success("Ingreso registrado exitosamente.");');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored', file);
}
