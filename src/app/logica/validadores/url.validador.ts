import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function esUrlValida(url: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const urlConProtocolo = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
    const parsed = new URL(urlConProtocolo);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function validadorUrl(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valida = esUrlValida(control.value);
    return valida ? null : { urlInvalida: true };
  };
}
