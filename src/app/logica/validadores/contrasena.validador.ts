import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface EvaluacionContrasena {
  longitudValida: boolean;
  tieneMayuscula: boolean;
  tieneNumero: boolean;
  tieneEspecial: boolean;
  esCompletamenteValida: boolean;
}

export function evaluarSeguridadContrasena(valor: string): EvaluacionContrasena {
  const longitudValida = Boolean(valor && valor.length >= 8);
  const tieneMayuscula = /[A-Z]/.test(valor || '');
  const tieneNumero = /\d/.test(valor || '');
  const tieneEspecial = /[^A-Za-z0-9]/.test(valor || '');

  return {
    longitudValida,
    tieneMayuscula,
    tieneNumero,
    tieneEspecial,
    esCompletamenteValida:
      longitudValida && tieneMayuscula && tieneNumero && tieneEspecial,
  };
}

export function validadorContrasenaSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const evaluacion = evaluarSeguridadContrasena(control.value);
    return evaluacion.esCompletamenteValida
      ? null
      : { contrasenaInsegura: evaluacion };
  };
}
