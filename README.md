# Swagger utils

- Do better documentation of API with with clearly arranged yaml files instead of one big file 
- Add swagger UI to your backend for simple documentation reading

### Instalation
Install package to our dependencies from NPM.
```
yarn add @qest/swagger-utils
```
or
```
npm install @qest/swagger-utils
```

## Swagger generator
It generates swagger yaml or json from partials yaml files which is merged together. You can separate documentation to folders to the code that implements functionality.

Yamls has parts of swagger yaml. You can separate routes, responses, object definitions and security definitions.

This is example for file with some route
```
paths:
  /API/v1/swagger:
    get:
      produces:
        - text/plain
      description: get swagger documentation of project in raw (string) format
      responses:
        200:
          description: documentation of project in raw (string) format
```
...other can be like this
```
paths:
  /API/v1/something/{id}
    get:
      responses:
        200:
          $ref: '#/responses/somethingResponse'
    delete:
      responses:
        200:
          description: delete something      

```
...and file with responses and object can be together.
```
responses:
  somethingResponse:
    description: this is response with array of someting
    schema:
      type: "object"
      properties:
        data:
          type: "array"
          items:
            $ref: '#/responses/TreeItem'
definitions:            
  Item:
    type: object
    properties:
      id:
        type: string                
      name:
        type: string        
```

### How to configure and use generator 

Swagger generator has configuration object with these properties:

|Property|Type|Default|Description
|---|---|---|---|
|descriptorInfo|```Object{ title:string; version:string; description:string; }```||Info object whitch title, version and base description
|includePaths|string[]|`['./src']`|Paths of folders that will be recursively crawled to find the yamls
|excludedDirsFromPaths|string[]||This paths will be excludet from crawling. but only this folders, not their subfolders
|schemes|string[]||Swagger definition of schemes (http, https, ws, etc..). If it's not defined, scheme of UI will be taken in swagger UI. Only for Swagger 2.0
|host|string||Swagger host of API. If it's not defined, host of UI will be taken in swagger UI
|basePath|string||Swagger basepath of API
|changeLogPath|string||If you have changelog txt file in your application, it can be included to description of API
|swaggerVersion|`2.0` or `3.0`|`2.0`|Version of swagger documentation

Example of configuration and use:
```
const swaggerGenerator = new SwaggerGenerator({
    descriptorInfo: { 
        version: '1.0.0', 
        title: 'something app', 
        description: 'description of app', 
    },
    includePaths: ['./path-to-docs-folders'],
    swaggerVersion: '2.0',
});

const objectResult = swaggerGenerator.getAsObject();
const jsonResult = swaggerGenerator.getAsJson();
``` 
The resulting structure for `getAsObject()` will contain all of files from previous example in one object .
```
{
    "basePath":"/",
    "swagger":"2.0",
    "info":{
        "version":"1.0.0",
        "title":"something app",
        "description":"description of app"
    },
    "paths":{
        "/API/v1/swagger":{
            "get":{...},
        },    
        "/API/v1/something/{id}":{
            "get":{...},
            "delete":{...},
        },        
    }
    "definitions":{
        "Item":{...}
    },
    "securityDefinitions":{...},
    "tags":[]
}
```
 
## Swagger express middlewares
In project are express middlewares for integraion of documentation to our project. First middleware are for swagger UI and the second for datasource.

```
Router()
    .get('/api/v1/swagger', swaggerDataMiddleware(swaggerGenerator))
    .use('/swagger', swaggerUiMiddleware({
            swaggerOptions: {
                url: '/api/v1/swagger',
            },
        })
    );
```

### Configuration
#### Swagger Data middleware
You must have instance of swagger generator and the second parameter say how data you can (json or yaml) in response.
#### Swagger UI middleware
For configuration see [configuration of swagger UI library](https://github.com/swagger-api/swagger-ui/blob/HEAD/docs/usage/configuration.md)