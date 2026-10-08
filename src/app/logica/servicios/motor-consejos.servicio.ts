import { Injectable } from '@angular/core';
import { ConsejoSeguridad, NivelRiesgo, ResultadoAnalisis } from '../../datos/modelos/analisis.modelo';

@Injectable({
  providedIn: 'root',
})
export class MotorConsejosServicio {
  private readonly bibliotecaConsejos: ConsejoSeguridad[] = [
    {
      palabraClave: 'Protocolo HTTP inseguro',
      titulo: '🔒 Falta de Cifrado',
      texto:
        'Nunca ingreses contraseñas o datos financieros en sitios HTTP. Cualquier intermediario en tu red podría interceptar esa información. Busca siempre el candado de seguridad (HTTPS).',
      tipo: 'advertencia',
    },
    {
      palabraClave: 'Usa dirección IP',
      titulo: '🕵️ Servidor Anónimo',
      texto:
        'Los atacantes con frecuencia emplean direcciones IP directas en lugar de nombres de dominio registrados para no dejar rastros y levantar campañas fraudulentas efímeras.',
      tipo: 'peligro',
    },
    {
      palabraClave: 'Parámetros sensibles en URL',
      titulo: '✂️ Datos Expuestos',
      texto:
        'El enlace transporta palabras clave como "login" o "password" en la dirección. Transmitir credenciales en los parámetros puede filtrar tu sesión.',
      tipo: 'advertencia',
    },
    {
      palabraClave: 'Muchos subdominios',
      titulo: '🧩 Ocultamiento por Subdominios',
      texto:
        'Los enlaces excesivamente anidados intentan confundir tu atención. Revisa la palabra principal previa a la extensión (.com, .co, .org).',
      tipo: 'advertencia',
    },
    {
      palabraClave: 'Typosquatting detectado',
      titulo: '👀 Suplantación de Identidad',
      texto:
        'El atacante simula la grafía de una marca legítima alterando letras de forma sutil. Tus credenciales corren un riesgo crítico.',
      tipo: 'peligro',
    },
    {
      palabraClave: 'Múltiples guiones en dominio',
      titulo: '➖ Dominio Camuflado',
      texto:
        'Los dominios con guiones reiterados suelen ser adquiridos en masa por cibercriminales debido a su bajo coste y caducidad inmediata.',
      tipo: 'advertencia',
    },
    {
      palabraClave: 'Confirmado en PhishTank',
      titulo: '🚨 Phishing Comprobado',
      texto:
        'Este enlace ya figura en bases internacionales de inteligencia contra amenazas. Es un fraude confirmado: cierra la pestaña de inmediato.',
      tipo: 'peligro',
    },
    {
      palabraClave: 'Google Safe Browsing',
      titulo: '🛡️ Bloqueo de Google',
      texto:
        'El motor de protección de Google ha clasificado este sitio como distribuidor de malware o páginas de suplantación.',
      tipo: 'peligro',
    },
    {
      palabraClave: 'VirusTotal',
      titulo: '☢️ Detección Multimotor',
      texto:
        'Diversos proveedores de ciberseguridad a nivel mundial han marcado este dominio como fraudulento o peligroso.',
      tipo: 'peligro',
    },
    {
      palabraClave: 'Reportado manualmente',
      titulo: '👥 Alerta Comunitaria',
      texto:
        'Analistas y usuarios de tu comunidad han validado manualmente la peligrosidad de este enlace.',
      tipo: 'peligro',
    },
  ];

  generarConsejos(analisis: Partial<ResultadoAnalisis>): ConsejoSeguridad[] {
    const consejosCoincidentes: ConsejoSeguridad[] = [];
    const indicadores = analisis.indicadores || [];

    for (const indicador of indicadores) {
      const encontrado = this.bibliotecaConsejos.find(
        (c) => c.palabraClave && indicador.toLowerCase().includes(c.palabraClave.toLowerCase())
      );
      if (encontrado) {
        consejosCoincidentes.push(encontrado);
      }
    }

    if (consejosCoincidentes.length === 0) {
      const riesgo: NivelRiesgo = analisis.riesgo || 'medio';
      if (riesgo === 'bajo') {
        consejosCoincidentes.push({
          titulo: '✅ Navegación Segura',
          texto:
            'No se detectaron indicios claros de fraude. Recuerda no compartir tus credenciales privadas salvo en canales corporativos verificados.',
          tipo: 'seguro',
        });
      } else if (riesgo === 'medio') {
        consejosCoincidentes.push({
          titulo: '⚠️ Precaución Requerida',
          texto:
            'Se han detectado factores atípicos (como certificados recientes o rutas compuestas). Verifica el remitente antes de introducir cualquier información.',
          tipo: 'advertencia',
        });
      } else {
        consejosCoincidentes.push({
          titulo: '📛 Riesgo Crítico',
          texto:
            'Múltiples factores técnicos y heurísticos confirman un potencial ataque de phishing. No interactúes con la página.',
          tipo: 'peligro',
        });
      }
    }

    // Deduplicar por título
    const mapaUnicos = new Map<string, ConsejoSeguridad>();
    for (const consejo of consejosCoincidentes) {
      if (!mapaUnicos.has(consejo.titulo)) {
        mapaUnicos.set(consejo.titulo, consejo);
      }
    }

    return Array.from(mapaUnicos.values());
  }
}
