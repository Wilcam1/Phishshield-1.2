import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio de Seguridad de Autenticación y Credenciales.
 * Implementa CSPRNG para tokens, hashing Scrypt con sal para contraseñas,
 * comparación resistente a timing attacks y expiración por TTL.
 */
class AuthService {
  constructor(options = {}) {
    this.tokenTtlMs = options.tokenTtlMs || 2 * 60 * 60 * 1000; // 2 Horas
    this.authFile = path.join(__dirname, '../data/auth.json');
    this.activeSessions = new Map(); // token -> { createdAt, expiresAt, username }
    
    // Inicializar credenciales seguras
    this._initCredentials();
  }

  /**
   * Hashea una contraseña usando Scrypt nativo de Node.js con sal criptográfica de 16 bytes.
   * Formato: salt:hash (hexadecimal)
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verifica una contraseña contra su hash de forma segura con timingSafeEqual.
   */
  verifyPassword(password, storedHash) {
    if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
      return false;
    }

    try {
      const [salt, key] = storedHash.split(':');
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedBuffer = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
    } catch {
      return false;
    }
  }

  _initCredentials() {
    try {
      const dataDir = path.dirname(this.authFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Si no existe auth.json, usar credenciales por defecto desde variables de entorno
      if (!fs.existsSync(this.authFile)) {
        const defaultUser = process.env.ADMIN_USERNAME || 'admin';
        const defaultPass = process.env.ADMIN_PASSWORD || 'Windows12@';
        const hashedPassword = this.hashPassword(defaultPass);

        const data = {
          username: defaultUser,
          passwordHash: hashedPassword,
          actualizado: new Date().toISOString()
        };

        fs.writeFileSync(this.authFile, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('⚠️ Error inicializando credenciales seguras:', err.message);
    }
  }

  _loadStoredCredentials() {
    try {
      if (fs.existsSync(this.authFile)) {
        return JSON.parse(fs.readFileSync(this.authFile, 'utf8'));
      }
    } catch (err) {
      console.error('❌ Error leyendo credenciales:', err.message);
    }

    // Respaldo desde process.env
    return {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: this.hashPassword(process.env.ADMIN_PASSWORD || 'Windows12@')
    };
  }

  /**
   * Valida credenciales de acceso y emite un token CSPRNG.
   */
  autenticar(username, password) {
    if (!username || !password) {
      return { exito: false, motivo: 'Credenciales incompletas' };
    }

    const credenciales = this._loadStoredCredentials();

    // Comparación segura de nombre de usuario
    const userMatch = username.trim().toLowerCase() === credenciales.username.trim().toLowerCase();
    const passMatch = this.verifyPassword(password, credenciales.passwordHash);

    if (userMatch && passMatch) {
      // Generar token criptográficamente seguro (256 bits)
      const token = 'psh_' + crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const expiresAt = now + this.tokenTtlMs;

      this.activeSessions.set(token, {
        username: credenciales.username,
        createdAt: now,
        expiresAt
      });

      return {
        exito: true,
        token,
        expiraEnSegundos: Math.round(this.tokenTtlMs / 1000)
      };
    }

    return { exito: false, motivo: 'Credenciales incorrectas' };
  }

  /**
   * Valida un token activo verificando que no haya expirado por TTL.
   */
  validarToken(token) {
    if (!token || !this.activeSessions.has(token)) {
      return false;
    }

    const session = this.activeSessions.get(token);
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Invalida un token (cierre de sesión).
   */
  cerrarSesion(token) {
    return this.activeSessions.delete(token);
  }

  /**
   * Cambia la contraseña actual verificando los requisitos de complejidad y la anterior.
   */
  cambiarContrasena(oldPassword, newPassword) {
    const credenciales = this._loadStoredCredentials();

    if (!this.verifyPassword(oldPassword, credenciales.passwordHash)) {
      return { exito: false, error: 'Contraseña actual incorrecta' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { exito: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' };
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasNumber || !hasSpecial) {
      return { exito: false, error: 'La nueva contraseña debe contener al menos una mayúscula, un número y un carácter especial.' };
    }

    try {
      const data = {
        username: credenciales.username,
        passwordHash: this.hashPassword(newPassword),
        actualizado: new Date().toISOString()
      };

      fs.writeFileSync(this.authFile, JSON.stringify(data, null, 2), 'utf8');

      // Invalidar todas las sesiones activas tras cambio de credenciales
      this.activeSessions.clear();

      return { exito: true, mensaje: 'Contraseña actualizada con éxito' };
    } catch (err) {
      return { exito: false, error: 'No se pudo almacenar el hash de la nueva contraseña' };
    }
  }
}

export default AuthService;
