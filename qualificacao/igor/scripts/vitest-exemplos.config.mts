import { fileURLToPath } from 'node:url';
import base from '../../../packages/ide/vitest.integration.config';

// Executes the two existing files cited as examples in the thesis.
export default {
  ...base,
  root: fileURLToPath(new URL('../../../packages/ide', import.meta.url)),
  test: {
    ...base.test,
    include: [
      'src/lib/keyword-language-storage.spec.ts',
      'src/components/keyword-customizer/wizard-stepper.spec.tsx',
    ],
  },
};
