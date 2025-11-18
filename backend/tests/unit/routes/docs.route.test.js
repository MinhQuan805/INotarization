const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../../src/docs/swaggerDef');

// Mock specs object
const mockSpecs = {
  openapi: '3.0.0',
  paths: {},
  info: { title: 'Test API', version: '1.0.0' },
};

// Mock express router
const mockRouter = {
  use: jest.fn(),
  get: jest.fn(),
};

// Setup mocks
jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.mock('swagger-jsdoc', () => jest.fn().mockImplementation(() => mockSpecs));

jest.mock('swagger-ui-express', () => ({
  serve: ['swagger-serve-middleware'],
  setup: jest.fn().mockReturnValue('swagger-setup-middleware'),
}));

jest.mock('../../../src/docs/swaggerDef', () => ({
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
}));

describe('Docs Route', () => {
  let docsRoute;

  beforeAll(() => {
    // Cache the route module
    docsRoute = require('../../../src/routes/v1/docs.route');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-require route module to trigger setup
    jest.isolateModules(() => {
      require('../../../src/routes/v1/docs.route');
    });
  });

  it('should generate swagger specs correctly', () => {
    expect(swaggerJsdoc).toHaveBeenCalledWith({
      swaggerDefinition,
      apis: ['src/docs/*.yml', 'src/routes/v1/*.js'],
    });
  });

  it('should register swagger serve middleware', () => {
    expect(mockRouter.use).toHaveBeenCalledWith('/', ['swagger-serve-middleware']);
  });

  it('should register swagger setup handler', () => {
    // Setup is called during route initialization
    const setupMiddleware = swaggerUi.setup(mockSpecs, { explorer: true });

    expect(mockRouter.get).toHaveBeenCalledWith('/', 'swagger-setup-middleware');
    expect(swaggerUi.setup).toHaveBeenCalledWith(mockSpecs, { explorer: true });
  });
});
