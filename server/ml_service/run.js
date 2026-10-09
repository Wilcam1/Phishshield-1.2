import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const venvPythonWin = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
const venvPythonLinux = path.join(__dirname, 'venv', 'bin', 'python');
const scriptPath = path.join(__dirname, 'main.py');

let pythonCmd = 'python';
if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonLinux)) {
  pythonCmd = venvPythonLinux;
}

console.log(`🤖 Iniciando microservicio de Machine Learning en puerto 8000 (${pythonCmd})...`);

const proc = spawn(pythonCmd, [scriptPath], {
  cwd: __dirname,
  stdio: 'inherit'
});

proc.on('error', (err) => {
  console.error('❌ Error al iniciar el microservicio de Python:', err.message);
  process.exit(1);
});

proc.on('close', (code) => {
  process.exit(code || 0);
});
