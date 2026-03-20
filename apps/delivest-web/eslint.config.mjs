import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    ignores: ['dist/**', 'node_modules/**', '.vite/**'],
  },

  ...pluginVue.configs['flat/essential'],

  vueTsConfigs.recommended,

  {
    files: ['**/*.{vue,ts,mts,tsx}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  eslintConfigPrettier,
)
