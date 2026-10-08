// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  /* Reglas de dependencia estricta entre capas */
  {
    files: ['src/app/presentacion/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/datos/repositorios/**',
                '**/datos/dto/**',
                '**/datos/mapeadores/**',
                '**/datos/fuentes/**',
                '@datos/repositorios/**',
                '@datos/dto/**',
                '@datos/mapeadores/**',
                '@datos/fuentes/**',
              ],
              message:
                'Violación de arquitectura: La capa de presentación solo puede importar de lógica y datos/modelos.',
            },
            {
              group: ['@angular/common/http'],
              message:
                'Violación de arquitectura: Los componentes y la capa de presentación no pueden usar HttpClient.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/logica/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/presentacion/**',
                '@presentacion/**',
              ],
              message:
                'Violación de arquitectura: La capa de lógica no puede importar de la capa de presentación.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/datos/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/presentacion/**',
                '**/logica/**',
                '@presentacion/**',
                '@logica/**',
              ],
              message:
                'Violación de arquitectura: La capa de datos no puede importar de lógica ni de presentación.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
