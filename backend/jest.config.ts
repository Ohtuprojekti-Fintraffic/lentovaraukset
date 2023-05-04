import sharedConfig from '@lentovaraukset/shared/jest.config';

export default {
    ...sharedConfig,
    setupFiles: ['<rootDir>/.jest/setEnvVars.ts'],
}
