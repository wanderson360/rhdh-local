import { createTranslationResource } from '@backstage/core-plugin-api/alpha';
import { catalogTranslationRef } from '@backstage/plugin-catalog/alpha';
import { catalogReactTranslationRef } from '@backstage/plugin-catalog-react/alpha';
import { coreComponentsTranslationRef } from '@backstage/core-components';

export const catalogTranslationsPT = createTranslationResource({
  ref: catalogTranslationRef,
  translations: {
    'pt-BR': () => import('./catalog-pt'),
  },
});

export const catalogReactTranslationsPT = createTranslationResource({
  ref: catalogReactTranslationRef,
  translations: {
    'pt-BR': () => import('./catalog-react-pt'),
  },
});

export const coreComponentsTranslationsPT = createTranslationResource({
  ref: coreComponentsTranslationRef,
  translations: {
    'pt-BR': () => import('./core-components-pt'),
  },
});

export {
  catalogTranslationRef,
  catalogReactTranslationRef,
  coreComponentsTranslationRef,
};
