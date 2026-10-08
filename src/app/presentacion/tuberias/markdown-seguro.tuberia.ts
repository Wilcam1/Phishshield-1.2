import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdownSeguro',
  standalone: true,
})
export class MarkdownSeguroTuberia implements PipeTransform {
  private readonly sanitizador = inject(DomSanitizer);

  transform(valor?: string | null): SafeHtml {
    if (!valor) return '';

    // Escapar caracteres peligrosos antes de procesar
    let contenido = valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Títulos de markdown: ### Título o ## Título
    contenido = contenido.replace(/^### (.*$)/gim, '<h5 class="markdown-h5">$1</h5>');
    contenido = contenido.replace(/^## (.*$)/gim, '<h4 class="markdown-h4">$1</h4>');

    // 2. Negritas: **texto** o __texto__
    contenido = contenido.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    contenido = contenido.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 3. Cursivas: *texto* o _texto_ (sin romper asteriscos residuales)
    contenido = contenido.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 4. Código inline: `código`
    contenido = contenido.replace(/`([^`]+)`/g, '<code class="markdown-codigo">$1</code>');

    // 5. Listas con guiones o asteriscos: - elemento o * elemento
    contenido = contenido.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="markdown-item">$1</li>');
    contenido = contenido.replace(/(<li class="markdown-item">.*<\/li>)/gms, '<ul class="markdown-lista">$1</ul>');

    // 6. Saltos de línea dobles y simples
    contenido = contenido.replace(/\n\n/g, '<br class="salto-doble"/>');
    contenido = contenido.replace(/\n/g, '<br/>');

    return this.sanitizador.bypassSecurityTrustHtml(contenido);
  }
}
