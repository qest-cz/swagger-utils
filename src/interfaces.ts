export interface IDescriptorInfo {
    title: string;
    version: string;
    description: string;
    changeLogPath?: string;
}

export interface IDescriptor20 {
    swagger: '2.0';
    info: IDescriptorInfo;
    paths: Object;
    definitions: Object;
    responses: Object;
    tags: any[];
    host: string;
    securityDefinitions: Object;
    security: Object[];
    basePath: string;
    schemes: any;
    produces: string[];
    consumes: string[];
}

export interface IDescriptor300 {
    swagger: '3.0.0';
    info: IDescriptorInfo;
    paths: Object;
    components: Object;
    tags: any[];
    security: Object[];
    servers: Object[];
}

export interface ISwaggerSetting {
    descriptorInfo: IDescriptorInfo;
    includePaths?: string[];
    excludedDirsFromPaths: string[];
    schemes?: string[];
    host?: string;
    basePath?: string;
    changeLogPath?: string;
    swaggerVersion?: '2.0' | '3.0.0';
}
