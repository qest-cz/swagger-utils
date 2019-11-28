import * as fs from 'fs';
import * as yamlParser from 'js-yaml';
import * as yamlFormatter from 'json-to-pretty-yaml';
import * as path from 'path';
import { IDescriptor, ISwaggerSetting } from '../interfaces';

export class SwaggerGenerator {
    private descriptor: IDescriptor;

    private includePaths: string[];
    private excludedDirsFromPaths: string[];
    private isGenerated = false;
    private setting: ISwaggerSetting;

    constructor(settings: ISwaggerSetting) {
        this.setting = settings;
        const { descriptorInfo, includePaths, excludedDirsFromPaths, host, basePath, schemes, swaggerVersion } = settings;

        const descriptionText = this.getDescriptionText();

        this.descriptor = {
            host,
            schemes,
            swagger: swaggerVersion ? swaggerVersion : '3.0',
            basePath: basePath ? basePath : '/',
            info: { ...descriptorInfo, ...{ description: descriptionText } },
            paths: {},
            definitions: {},
            responses: {},
            securityDefinitions: {},
            tags: [],
        };
        this.includePaths = includePaths;
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

    getDescriptionText() {
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
        const definitionsFragments = ['definitions', 'responses', 'securityDefinitions'];
        for (const componentFragment of definitionsFragments) {
            if (docFragment[componentFragment]) {
                this.descriptor[componentFragment] = {
                    ...this.descriptor[componentFragment],
                    ...docFragment[componentFragment],
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
        this.descriptor.definitions = this.sortKeys(this.descriptor.definitions);
    }

    private sortKeys(object: { [key: string]: any }) {
        const obj = {};
        const keys = Object.keys(object).sort();
        keys.forEach((key) => (obj[key] = object[key]));
        return obj;
    }
}
