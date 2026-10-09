import { describe, it, expect, beforeEach } from 'vitest';
import AuthService from '../security/authService.js';

describe('AuthService (Security Unit Tests)', () => {
  let auth;

  beforeEach(() => {
    auth = new AuthService({ tokenTtlMs: 500 }); // TTL corto de 500ms para pruebas
  });

  it('debe hashear y verificar contraseñas correctamente usando Scrypt y sal', () => {
    const rawPass = 'MiPasswordSegura#2026';
    const hash = auth.hashPassword(rawPass);

    expect(hash).toContain(':');
    expect(auth.verifyPassword(rawPass, hash)).toBe(true);
    expect(auth.verifyPassword('PasswordIncorrecta!', hash)).toBe(false);
  });

  it('debe emitir tokens CSPRNG seguros al autenticar', () => {
    const res = auth.autenticar('admin', 'Windows12@');
    expect(res.exito).toBe(true);
    expect(res.token).toMatch(/^psh_[0-9a-f]{64}$/); // 32 bytes en hex
    expect(auth.validarToken(res.token)).toBe(true);
  });

  it('debe rechazar credenciales incorrectas', () => {
    const res = auth.autenticar('admin', 'ClaveEquivocada!');
    expect(res.exito).toBe(false);
  });

  it('debe expirar el token una vez transcurrido el TTL', async () => {
    const res = auth.autenticar('admin', 'Windows12@');
    expect(auth.validarToken(res.token)).toBe(true);

    // Esperar a que expire el TTL (500ms)
    await new Promise(resolve => setTimeout(resolve, 550));
    expect(auth.validarToken(res.token)).toBe(false);
  });
});
