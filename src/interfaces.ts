export enum SwaggerVersions {
    TWO = '2.0',
    THREE = '3.0.0',
}

export interface IDescriptorInfo {
    title: string;
    version: string;
    description: string;
    changeLogPath?: string;
}

export interface IDescriptor20 {
    swagger: SwaggerVersions.TWO;
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
    openapi: SwaggerVersions.THREE;
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
    swaggerVersion?: SwaggerVersions;
}
