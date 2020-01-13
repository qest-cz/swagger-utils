import * as fs from 'fs';
import * as yamlParser from 'js-yaml';
import * as yamlFormatter from 'json-to-pretty-yaml';
import * as path from 'path';

import { IDescriptor20, IDescriptor300, ISwaggerSetting, SwaggerVersions } from '../interfaces';

export class SwaggerGenerator {
    private descriptor: IDescriptor20 | IDescriptor300;

    private includePaths: string[];
    private excludedDirsFromPaths: string[];
    private isGenerated = false;
    private setting: ISwaggerSetting;

    constructor(settings: ISwaggerSetting) {
        this.setting = settings;
        const { includePaths, excludedDirsFromPaths, swaggerVersion } = settings;

        if (swaggerVersion === SwaggerVersions.TWO) {
            this.createDescriptor20();
        } else {
            this.createDescriptor300();
        }
        this.includePaths = includePaths ? includePaths : ['./src'];
        this.excludedDirsFromPaths = excludedDirsFromPaths;
    }

    getAsYaml() {
        this.generateOnce();
        return yamlFormatter.stringify(this.descriptor);
    }

    getAsObject() {
        this.generateOnce();
        return this.descriptor;
    }

    private getDescriptionText() {
        const { changeLogPath, descriptorInfo } = this.setting;
        if (changeLogPath) {
            const changeLog = fs.readFileSync(changeLogPath).toString();
            return `${descriptorInfo.description} \n ${changeLog}`;
        }

        return descriptorInfo.description;
    }

    private addPathMethod(api: { paths: string[] }) {
        for (const fullPath of Object.keys(api.paths)) {
            for (const method of Object.keys(api.paths[fullPath])) {
                const methodDescr = api.paths[fullPath][method];

                if (!this.descriptor.paths[fullPath]) {
                    this.descriptor.paths[fullPath] = {};
                }
                this.descriptor.paths[fullPath][method] = methodDescr;
                if (methodDescr.tags) {
                    this.descriptor.tags.concat(methodDescr.tags);
                }
            }
        }
    }

    private completeDocFragment(docFragment: { paths: string[] }) {
        if (!docFragment) {
            return;
        }
        let fragmentExist = false;
        if (docFragment.paths) {
            this.addPathMethod(docFragment);
            fragmentExist = true;
        }
        const definitionsFragments = [];
        if (this.setting.swaggerVersion === SwaggerVersions.TWO) {
            definitionsFragments.push('definitions', 'responses', 'securityDefinitions', 'consumes', 'produces', 'security');
        } else {
            definitionsFragments.push('components', 'security');
        }

        for (const componentFragment of definitionsFragments) {
            if (docFragment[componentFragment]) {
                const keys = componentFragment === 'components' ? Object.keys(this.descriptor[componentFragment]) : [];
                this.descriptor[componentFragment] = {
                    ...this.descriptor[componentFragment],
                    ...docFragment[componentFragment],
                    ...keys.reduce(
                        (acc, currentKey) => ({
                            ...acc,
                            [currentKey]: {
                                ...this.descriptor[componentFragment][currentKey],
                                ...docFragment[componentFragment][currentKey],
                            },
                        }),
                        {},
                    ),
                };
                fragmentExist = true;
            }
        }
        if (!fragmentExist) {
            throw new Error('swagger fragment is not recognized.');
        }
    }

    private parseYmlFile(file: string) {
        const resource = fs.readFileSync(path.resolve(process.cwd(), file)).toString();
        const docFragments = yamlParser.safeLoadAll(resource);

        for (const fragment of docFragments) {
            this.completeDocFragment(fragment);
        }
    }

    private getFiles(fullPath, files) {
        fs.readdirSync(fullPath).forEach((file) => {
            const subpath = `${fullPath}/${file}`;
            if (fs.lstatSync(subpath).isDirectory()) {
                if (this.excludedDirsFromPaths.indexOf(subpath) === -1) {
                    this.getFiles(subpath, files);
                }
            } else if (file.indexOf('.yml') !== -1) {
                files.push(`${fullPath}/${file}`);
            }
        });
    }

    private generateOnce() {
        if (!this.isGenerated) {
            this.generate();
            this.isGenerated = false;
        }
    }

    private generate() {
        const files = [];
        this.includePaths.forEach((includePath) => {
            const fullPath = path.join(includePath);
            this.getFiles(fullPath, files);
        });
        files.forEach((file) => {
            this.parseYmlFile(file);
        });
        this.descriptor.paths = this.sortKeys(this.descriptor.paths);
        if ('definitions' in this.descriptor) {
            this.descriptor.definitions = this.sortKeys(this.descriptor.definitions);
        }
    }

    private sortKeys(object: { [key: string]: any }) {
        const obj = {};
        const keys = Object.keys(object).sort();
        keys.forEach((key) => (obj[key] = object[key]));
        return obj;
    }

    private createDescriptor20() {
        const { descriptorInfo, host, basePath, schemes, swaggerVersion } = this.setting;
        this.descriptor = <IDescriptor20>{
            host,
            schemes,
            swagger: swaggerVersion,
            basePath: basePath ? basePath : '/',
            info: { ...descriptorInfo, ...{ description: this.getDescriptionText() } },
            paths: {},
            definitions: {},
            responses: {},
            securityDefinitions: {},
            security: [],
            tags: [],
            consumes: [],
            produces: [],
        };
    }

    private createDescriptor300() {
        const { descriptorInfo, host, basePath, swaggerVersion } = this.setting;
        this.descriptor = <IDescriptor300>{
            openapi: swaggerVersion || '3.0.0',
            info: { ...descriptorInfo, ...{ description: this.getDescriptionText() } },
            paths: {},
            security: [],
            components: [],
            tags: [],
            servers: [
                {
                    url: host + basePath ? basePath : '/',
                },
            ],
        };
    }
}
