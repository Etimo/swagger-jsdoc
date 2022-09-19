const path = require('path');
const specModule = require('../src/specification');
const swaggerObject = require('./files/v2/swaggerObject.json');

describe('Specification module', () => {
  describe('build', () => {
    it('should be a function', () => {
      expect(typeof specModule.build).toBe('function');
    });

    it('should return right object', () => {
      expect(
        specModule.build({
          swaggerDefinition: {},
          apis: ['./**/*/external/*.yml'],
        })
      ).toEqual({
        swagger: '2.0',
        paths: {},
        definitions: {},
        responses: {
          api: {
            foo: { 200: { description: 'OK' } },
            bar: { 200: { description: 'OK' } },
          },
        },
        parameters: {},
        securityDefinitions: {},
        tags: [],
      });
    });

    it('should have filepath in error (yaml)', () => {
      try {
        specModule.build({
          swaggerDefinition: {},
          apis: [path.resolve(__dirname, './files/v2/wrong_syntax.yaml')],
          failOnErrors: true,
        });
      } catch (e) {
        expect(e.message).toContain(
          path.resolve(__dirname, './files/v2/wrong_syntax.yaml')
        );
      }
    });

    it('should have filepath in error (jsdoc)', () => {
      try {
        specModule.build({
          swaggerDefinition: {},
          apis: [
            path.resolve(__dirname, './files/v2/wrong-yaml-identation.js'),
          ],
          failOnErrors: true,
        });
      } catch (e) {
        expect(e.message).toContain(
          path.resolve(__dirname, './files/v2/wrong-yaml-identation.js')
        );
      }
    });

    it('should support a flag for verbose errors', () => {
      try {
        specModule.build({
          swaggerDefinition: {},
          apis: [
            path.resolve(__dirname, './files/v2/wrong-yaml-identation.js'),
          ],
          failOnErrors: true,
          verbose: true,
        });
      } catch (e) {
        expect(e.message).toContain(
          path.resolve(__dirname, './files/v2/wrong-yaml-identation.js')
        );
        expect(e.message).toContain('invalid_yaml');
      }
    });
  });

  describe('organize', () => {
    it('should be a function', () => {
      expect(typeof specModule.organize).toBe('function');
    });

    it('should handle "definitions"', () => {
      const annotation = {
        definitions: {
          testDefinition: {
            required: ['username', 'password'],
            properties: {
              username: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
          },
        },
      };
      specModule.organize(swaggerObject, annotation, 'definitions');
      expect(swaggerObject.definitions).toEqual({
        testDefinition: {
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
      });
    });

    it('should handle "parameters"', () => {
      const annotation = {
        parameters: {
          testParameter: {
            name: 'limit',
            in: 'query',
            description: 'max records to return',
            required: true,
            type: 'integer',
            format: 'int32',
          },
        },
      };
      specModule.organize(swaggerObject, annotation, 'parameters');
      expect(swaggerObject.parameters).toEqual({
        testParameter: {
          name: 'limit',
          in: 'query',
          description: 'max records to return',
          required: true,
          type: 'integer',
          format: 'int32',
        },
      });
    });

    it('should handle "securityDefinitions"', () => {
      const annotation = {
        securityDefinitions: {
          basicAuth: {
            type: 'basic',
            description:
              'HTTP Basic Authentication. Works over `HTTP` and `HTTPS`',
          },
        },
      };
      specModule.organize(swaggerObject, annotation, 'securityDefinitions');
      expect(swaggerObject.securityDefinitions).toEqual({
        basicAuth: {
          type: 'basic',
          description:
            'HTTP Basic Authentication. Works over `HTTP` and `HTTPS`',
        },
      });
    });

    it('should handle "responses"', () => {
      const annotation = {
        responses: {
          IllegalInput: {
            description: 'Illegal input for operation.',
          },
        },
      };
      specModule.organize(swaggerObject, annotation, 'responses');
      expect(swaggerObject.responses).toEqual({
        IllegalInput: { description: 'Illegal input for operation.' },
      });
    });
  });

  describe('format', () => {
    it('should not modify input object when no format specified', () => {
      expect(specModule.format({ foo: 'bar' })).toEqual({ foo: 'bar' });
    });

    it('should support yaml', () => {
      expect(specModule.format({ foo: 'bar' }, '.yaml')).toEqual('foo: bar\n');
      expect(specModule.format({ foo: 'bar' }, '.yml')).toEqual('foo: bar\n');
    });
  });
});
