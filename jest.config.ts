/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: './',
  preset: 'ts-jest',
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  testPathIgnorePatterns: ['/node_modules/', 'dist', 'build'],
  verbose: true,
};

export default config;
