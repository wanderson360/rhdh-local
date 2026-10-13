import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { coreComponentsTranslationRef } from '@backstage/core-components';

const coreComponentsMessagesPT = createTranslationMessages({
  ref: coreComponentsTranslationRef,
  full: false,
  messages: {
  'table.body.emptyDataSourceMessage': 'Nenhum registro para exibir',
  'table.pagination.firstTooltip': 'Primeira página',
  'table.pagination.labelDisplayedRows': '{from}-{to} de {count}',
  'table.pagination.labelRowsSelect': 'linhas',
  'table.pagination.lastTooltip': 'Última página',
  'table.pagination.nextTooltip': 'Próxima página',
  'table.pagination.previousTooltip': 'Página anterior',
  'table.toolbar.search': 'Pesquisar',
  'table.header.actions': 'Ações',
  },
});

export default coreComponentsMessagesPT;
