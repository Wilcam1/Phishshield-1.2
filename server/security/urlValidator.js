import net from 'net';

/**
 * Módulo de validación de seguridad de URLs contra ataques SSRF y protocolos no autorizados.
 */
class UrlSecurityValidator {
  /**
   * Verifica si una IP pertenece a rangos privados, loopback o metadata de nubes.
   * @param {string} ip
   * @returns {boolean} true si es privada o prohibida
   */
  static esIpPrivadaOProhibida(ip) {
    if (!ip) return false;

    // IPv6 Loopback y link-local
    if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
      return true;
    }

    if (!net.isIPv4(ip)) {
      return false;
    }

    const partes = ip.split('.').map(Number);
    const [p0, p1] = partes;

    // 127.0.0.0/8 (Loopback)
    if (p0 === 127) return true;

    // 0.0.0.0/8 (Red actual)
    if (p0 === 0) return true;

    // 10.0.0.0/8 (Privada Clase A)
    if (p0 === 10) return true;

    // 172.16.0.0/12 (Privada Clase B: 172.16.x.x - 172.31.x.x)
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

    // 192.168.0.0/16 (Privada Clase C)
    if (p0 === 192 && p1 === 168) return true;

    // 169.254.0.0/16 (Link-Local y AWS/GCP/Azure Metadata: 169.254.169.254)
    if (p0 === 169 && p1 === 254) return true;

    // 224.0.0.0/4 (Multicast) y 240.0.0.0/4 (Reservadas)
    if (p0 >= 224) return true;

    return false;
  }

  /**
   * Valida exhaustivamente una URL de entrada para evitar SSRF.
   * @param {string} urlString
   * @returns {{ valida: boolean, motivo?: string, urlNormalizada?: string, hostname?: string }}
   */
  static validarUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return { valida: false, motivo: 'URL vacía o no provista' };
    }

    const entrada = urlString.trim();

    // Longitud máxima de seguridad
    if (entrada.length > 2048) {
      return { valida: false, motivo: 'La URL supera la longitud máxima permitida (2048 caracteres)' };
    }

    let urlObj;
    try {
      let conProtocolo = entrada;
      if (!entrada.includes('://')) {
        conProtocolo = `https://${entrada}`;
      }
      urlObj = new URL(conProtocolo);
    } catch {
      return { valida: false, motivo: 'Formato de URL sintácticamente inválido' };
    }

    // 1. Validar protocolo permitido (únicamente http y https)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valida: false, motivo: `Protocolo no permitido: "${urlObj.protocol}". Solo se admite HTTP y HTTPS.` };
    }

    const hostname = urlObj.hostname.toLowerCase();

    // 2. Bloquear hostname de loopback / localhost
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      return { valida: false, motivo: 'Acceso a direcciones de Loopback/Localhost bloqueado por seguridad (SSRF).' };
    }

    // 3. Bloquear intentos con IP privada o metadata
    if (net.isIP(hostname)) {
      if (this.esIpPrivadaOProhibida(hostname)) {
        return { valida: false, motivo: `Acceso a dirección IP privada o reservada (${hostname}) bloqueado (SSRF).` };
      }
    }

    // 4. Bloquear dominios especiales de metadata en nubes
    if (
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.metadata.google.internal') ||
      hostname === 'instance-data'
    ) {
      return { valida: false, motivo: 'Acceso a metadatos de infraestructura cloud bloqueado (SSRF).' };
    }

    return {
      valida: true,
      urlNormalizada: urlObj.href,
      hostname: hostname
    };
  }
}

export default UrlSecurityValidator;
