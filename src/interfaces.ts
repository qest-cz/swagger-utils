export interface IDescriptorInfo {
    title: string;
    version: string;
    description: string;
    changeLogPath?: string;
}

export interface IDescriptor {
    swagger: '2.0';
    info: IDescriptorInfo;
    paths: Object;
    definitions: Object;
    responses: Object;
    tags: any[];
    host: string;
    securityDefinitions: Object;
    basePath: string;
    schemes: any;
}

export interface ISwaggerSetting {
    descriptorInfo: IDescriptorInfo;
    includePaths: string[];
    excludedDirsFromPaths: string[];
    schemes?: string[];
    host?: string;
    basePath?: string;
    changeLogPath?: string;
}
