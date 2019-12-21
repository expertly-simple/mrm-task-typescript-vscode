import { install, json, lines, makeDirs, packageJson } from 'mrm-core'

import { BaseVsCodeSettings } from '../shared'
import { BaseVsCodeExtensions } from '../shared/baseVsCodeExtensions'
import {
  configureCommonNpmPackages,
  configureImportSort,
  configureInitEnv,
  configurePRTemplate,
  configurePrettier,
  configureTsLint,
} from '../shared/commonTasks'
import { setScripts } from '../shared/helpers'

function task() {
  configureCommonNpmPackages()
  configureNpmScripts()
  configureImportSort()
  configureTypeScript()
  configureBaseTsLint()
  configurePrettier()
  configureVsCodeForTypeScript()
  configureJasmineAndNyc()
  configureInitEnv()
  configurePRTemplate()
}

function configureTypeScript() {
  install(['typescript', '@types/node'])

  json('tsconfig.json')
    .merge({
      compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
        moduleResolution: 'node',
        lib: ['es2015', 'es2016', 'es2017', 'es2018', 'es2019'],
        typeRoots: ['node_modules/@types'],
        resolveJsonModule: true,
      },
    })
    .save()

  json('tsconfig.src.json')
    .merge({
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,

        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        experimentalDecorators: true,
        strictPropertyInitialization: false,

        sourceMap: true,
      },
      include: ['./src'],
    })
    .save()

  makeDirs(['src', 'dist'])

  if (!lines('src/index.ts').exists) {
    lines('src/index.ts', [
      "export const message = 'Hello, world!'",
      'console.log(message)',
      "// Execute 'npm run build' to build your code",
      "// Execute 'npm start' to build and run your code",
      "// Execute 'npm test' to run your tests",
    ]).save()
  }
}

function configureJasmineAndNyc() {
  const jasminePackages = [
    'ts-node',
    'jasmine',
    'jasmine-node',
    'jasmine-xml-reporter',
    '@types/jasmine',
  ]
  const nycPackages = ['@istanbuljs/nyc-config-typescript', 'nyc', 'source-map-support']
  install(jasminePackages.concat(nycPackages))

  const pkg = packageJson()

  setScripts(pkg, {
    pretest: 'npm run build && npm run build:test',
    test: 'ts-node node_modules/jasmine/bin/jasmine --config=./jasmine.json',
    'test:ci':
      'ts-node ./node_modules/jasmine-xml-reporter/bin/jasmine.js --config=./jasmine.json --junitreport --output=test_results/',
    'test:nyc':
      'nyc ts-node node_modules/jasmine/bin/jasmine --config=./jasmine.json --cache=false',
  })

  json('jasmine.json')
    .merge({
      spec_dir: 'tests',
      spec_files: ['**/*[sS]pec.ts'],
      stopSpecOnExpectationFailure: false,
      random: true,
    })
    .save()

  json('.nycrc')
    .merge({
      extends: '@istanbuljs/nyc-config-typescript',
      all: true,
      'check-coverage': true,
      extension: ['.ts', '.tsx'],
      exclude: ['**/*.d.ts', '**/tests', '**/coverage'],
      reporter: ['lcov', 'text'],
      branches: 90,
      lines: 90,
      functions: 90,
      statements: 90,
    })
    .save()

  makeDirs('tests')
  json('tests/tsconfig.spec.json')
    .merge({
      extends: '../tsconfig.json',
      compilerOptions: {
        declaration: false,
        strict: false,
        sourceMap: true,
        noImplicitAny: false,
        types: ['node', 'jasmine'],
      },
    })
    .save()

  if (!lines('tests/index.spec.ts').exists) {
    lines('tests/index.spec.ts', [
      "import { message } from '../src/index'",
      '',
      "describe('Index', () => {",
      "  it('should have the correct message', () => {",
      "    expect('Hello, world!').toEqual(message)",
      '  })',
      '})',
    ]).save()
  }
}

function configureNpmScripts() {
  install('env-cmd')
  const pkg = packageJson()

  setScripts(pkg, {
    style:
      'import-sort -l "{lib,tests}/**/*.ts" && prettier --check "{lib,tests}/**/*.ts"',
    'style:fix':
      'import-sort --write "{lib,tests}/**/*.ts" && prettier --write "{lib,tests}/**/*.ts"',
    lint: 'tslint --config tslint.json --project .',
    'lint:fix': 'tslint --config tslint.json --fix --project .',
    prestart: 'npm run build',
    start: 'env-cmd node dist/index.js',
    prebuild: 'rimraf dist',
    build: 'tsc -p tsconfig.src.json',
    'build:test': 'tsc -p tests/tsconfig.spec.json',
    prepublishOnly: 'npm run test',
    prepare: 'npm run build',
  })
}

function configureBaseTsLint() {
  json('tslint.json')
    .merge({
      rules: {
        'array-type': false,
        'arrow-parens': false,
        deprecation: {
          severity: 'warn',
        },
        'import-blacklist': [true, 'rxjs/Rx'],
        'interface-name': false,
        'max-classes-per-file': false,
        'member-access': false,
        'member-ordering': [
          true,
          {
            order: ['static-field', 'instance-field', 'static-method', 'instance-method'],
          },
        ],
        'no-consecutive-blank-lines': false,
        'no-console': [true, 'debug', 'info', 'time', 'timeEnd', 'trace'],
        'no-empty': false,
        'no-inferrable-types': [true, 'ignore-params'],
        'no-non-null-assertion': true,
        'no-redundant-jsdoc': true,
        'no-switch-case-fall-through': true,
        'no-var-requires': false,
        'object-literal-key-quotes': [true, 'as-needed'],
        'object-literal-sort-keys': false,
        'ordered-imports': false,
        'trailing-comma': false,
      },
    })
    .save()
  configureTsLint()
}

function configureVsCodeForTypeScript() {
  json('.vscode/extensions.json')
    .merge({
      recommendations: BaseVsCodeExtensions,
    })
    .save()

  json('.vscode/settings.json')
    .merge(
      Object.assign(BaseVsCodeSettings, {
        'files.exclude': {
          '**/.git': true,
          '**/.DS_Store': true,
          '**/*.js': {
            when: '$(basename).ts',
          },
          '**/*.js.map': {
            when: '$(basename)',
          },
        },
      })
    )
    .save()

  json('.vscode/launch.json')
    .merge({
      version: '0.2.0',
      configurations: [
        {
          name: 'Jasmine Current Spec File',
          type: 'node',
          request: 'launch',
          program: '${workspaceRoot}/node_modules/jasmine/bin/jasmine.js',
          args: ['tests/${fileBasenameNoExtension}.js'],
          env: {
            NODE_PATH: '.',
          },
          preLaunchTask: 'npm: build:test',
        },
      ],
    })
    .save()
}

task.description = 'Configures VS Code for TypeScript projects'
module.exports = task
