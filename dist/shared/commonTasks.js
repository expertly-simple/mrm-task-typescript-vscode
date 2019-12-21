"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mrm_core_1 = require("mrm-core");
const helpers_1 = require("./helpers");
function configureCommonNpmPackages() {
    const commonNpm = ['cross-conf-env', 'npm-run-all', 'dev-norms', 'rimraf'];
    mrm_core_1.install(commonNpm);
}
exports.configureCommonNpmPackages = configureCommonNpmPackages;
function configureImportSort() {
    const importSortPackages = [
        'import-sort',
        'import-sort-cli',
        'import-sort-parser-typescript',
        'import-sort-style-module',
    ];
    mrm_core_1.install(importSortPackages);
    const pkg = mrm_core_1.packageJson();
    pkg
        .set('importSort', {
        '.ts, .tsx': {
            parser: 'typescript',
            style: 'module',
            options: {},
        },
    })
        .save();
}
exports.configureImportSort = configureImportSort;
function configureTsLint() {
    const tslintPackages = ['tslint', 'tslint-etc'];
    mrm_core_1.install(tslintPackages);
    helpers_1.addArrayProperty('tslint.json', 'extends', 'tslint-etc');
    mrm_core_1.json('tslint.json')
        .set('rules.no-unused-declaration', true)
        .set('rules.max-line-length', [false, 90])
        .set('rules.quotemark', [true, 'single', 'avoid-escape'])
        .set('rules.semicolon', [true, 'never'])
        .save();
}
exports.configureTsLint = configureTsLint;
function configurePrettier() {
    const prettierPackages = ['prettier'];
    mrm_core_1.install(prettierPackages);
    mrm_core_1.lines('.prettierignore', ['**/*.html']).save();
    mrm_core_1.json('.prettierrc')
        .merge({
        tabWidth: 2,
        useTabs: false,
        printWidth: 90,
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
        jsxBracketSameLine: true,
    })
        .save();
    const pkg = mrm_core_1.packageJson();
    if (pkg.get('devDependencies.tslint')) {
        const prettierTslintPackages = ['tslint-config-prettier', 'tslint-plugin-prettier'];
        mrm_core_1.install(prettierTslintPackages);
        helpers_1.addArrayProperty('tslint.json', 'extends', 'tslint-config-prettier');
        helpers_1.addArrayProperty('tslint.json', 'extends', 'tslint-plugin-prettier');
        mrm_core_1.json('tslint.json')
            .set('rules.prettier', true)
            .save();
    }
}
exports.configurePrettier = configurePrettier;
function configurePRTemplate() {
    if (!mrm_core_1.lines('pull_request_template.md').exists()) {
        mrm_core_1.lines('pull_request_template.md')
            .set([
            '# Feature/Change Description',
            '',
            '_Describe changes made here, link to any issue that is addressed_',
            '',
            '# Developer Checklist',
            '',
            '- [ ] Updated documentation or README.md',
            '- [ ] If adding new feature(s), added and ran unit tests',
            '- [ ] If create new release, bumped version number',
            '- [ ] Ran `npm run style:fix` for code style enforcement',
            '- [ ] Ran `npm run lint:fix` for linting',
            '- [ ] Ran `npm audit` to discover vulnerabilities',
        ])
            .save();
    }
}
exports.configurePRTemplate = configurePRTemplate;
function configureInitEnv() {
    mrm_core_1.install(['init-dev-env']);
    if (!mrm_core_1.lines('example.env').exists()) {
        mrm_core_1.lines('example.env')
            .set([
            '# Document required environment variables for .env file here',
            '# Execute npm run init:env to generate a .env file from example',
            'MY_VAR=defaultValue',
        ])
            .save();
    }
    const pkg = mrm_core_1.packageJson();
    helpers_1.setScripts(pkg, {
        'init:env': 'init-dev-env generate-dot-env example.env -f',
    });
    mrm_core_1.lines('.gitignore')
        .add(['.env'])
        .save();
}
exports.configureInitEnv = configureInitEnv;
//# sourceMappingURL=commonTasks.js.map