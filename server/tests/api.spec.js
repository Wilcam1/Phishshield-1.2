import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import PhishShieldServer from '../app.js';

describe('Express API Endpoints (Backend Integration Tests)', () => {
  let app;
  let serverInstance;

  beforeAll(() => {
    serverInstance = new PhishShieldServer();
    app = serverInstance.app;
  });

  describe('GET /health', () => {
    it('debe responder 200 con el estado del servicio y versión', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.servicio).toContain('PhishShield');
      expect(res.body.version).toBe('2.0.0');
    });
  });

  describe('GET /estadisticas', () => {
    it('debe responder 200 con contadores numéricos y distribución', async () => {
      const res = await request(app).get('/estadisticas');
      expect(res.status).toBe(200);
      expect(typeof res.body.total_analisis).toBe('number');
      expect(typeof res.body.reportes_phishing).toBe('number');
      expect(res.body.distribucion_riesgo).toBeDefined();
    });
  });

  describe('GET /historial', () => {
    it('debe responder 200 con un arreglo de auditoría', async () => {
      const res = await request(app).get('/historial?limite=5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /reportar', () => {
    it('debe rechazar solicitudes sin URL con código 400', async () => {
      const res = await request(app).post('/reportar').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe registrar un reporte válido con código 200', async () => {
      const testDomain = 'phish-test-' + Date.now() + '.xyz';
      const res = await request(app).post('/reportar').send({ url: `http://${testDomain}` });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /analizar', () => {
    it('debe rechazar solicitudes con URL vacía con código 400', async () => {
      const res = await request(app).post('/analizar').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe responder con resultado forense estructurado para URL legítima', async () => {
      const res = await request(app).post('/analizar').send({ url: 'https://example.com' });
      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
      expect(res.body.riesgo).toMatch(/bajo|medio|alto/);
      expect(typeof res.body.puntuacion).toBe('number');
      expect(res.body.caracteristicas_tecnicas).toBeDefined();
    });
  });

  describe('POST /api/login y rutas protegidas', () => {
    it('debe rechazar credenciales incorrectas con 401', async () => {
      const res = await request(app).post('/api/login').send({
        username: 'admin',
        password: 'contrasena_incorrecta'
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debe bloquear acceso a /api/admin/export/reportes sin token de autorización', async () => {
      const res = await request(app).get('/api/admin/export/reportes');
      expect([401, 403]).toContain(res.status);
    });
  });
});
