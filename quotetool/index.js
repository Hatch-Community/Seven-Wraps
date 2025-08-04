const express = require('express');
const { readdir, stat } = require('fs/promises');
const { join, dirname, relative, extname } = require('path');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Recursively scans a directory for route files and returns their paths
 * @param {string} dir - Directory to scan
 * @param {string[]} fileList - Accumulator for file paths
 * @returns {Promise<{success: boolean, error: string|null, data: string[]}>}
 */
async function getRouteFiles(dir, fileList = []) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        // Recursively scan subdirectories
        const subResult = await getRouteFiles(filePath, fileList);
        if (!subResult.success) {
          return subResult;
        }
      } else if (fileStat.isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
        fileList.push(filePath);
      }
    }
    
    return {
      success: true,
      error: null,
      data: fileList
    };
  } catch (error) {
    return {
      success: false,
      error: `Error scanning directory ${dir}: ${error.message}`,
      data: null
    };
  }
}

/**
 * Converts file path to URL endpoint
 * @param {string} filePath - File path relative to routes directory
 * @returns {{success: boolean, error: string|null, data: string}}
 */
function filePathToEndpoint(filePath) {
  try {
    const routesDir = join(__dirname, 'routes');
    const relativePath = relative(routesDir, filePath);
    const pathWithoutExt = relativePath.replace(extname(relativePath), '');
    
    // Convert file separators to URL separators and prepend /api
    let endpoint = '/api/' + pathWithoutExt.replace(/\\/g, '/');
    
    // Clean up double slashes and ensure proper formatting
    endpoint = endpoint.replace(/\/+/g, '/');
    
    // Remove any trailing slashes
    if (endpoint.length > 1 && endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }
    
    // Validate the endpoint doesn't contain problematic characters
    if (endpoint.includes('[') || endpoint.includes(']') || endpoint.includes(':') || endpoint.includes('*')) {
      // Escape problematic characters or replace them
      endpoint = endpoint.replace(/[\[\]]/g, '');
    }
    
    return {
      success: true,
      error: null,
      data: endpoint
    };
  } catch (error) {
    return {
      success: false,
      error: `Error converting file path to endpoint: ${error.message}`,
      data: null
    };
  }
}

/**
 * Dynamically imports and mounts route handlers
 * @returns {Promise<{success: boolean, error: string|null, data: object}>}
 */
async function mountRoutes() {
  const routesDir = join(__dirname, 'routes');
  
  try {
    const routeFilesResult = await getRouteFiles(routesDir);
    
    if (!routeFilesResult.success) {
      return routeFilesResult;
    }

    const routeFiles = routeFilesResult.data;
    console.log(`Found ${routeFiles.length} route files`);
    
    const mountedRoutes = [];
    const supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
    
    for (const filePath of routeFiles) {
      try {
        // Clear require cache to allow hot reloading in development
        delete require.cache[require.resolve(filePath)];
        
        const routeModule = require(filePath);
        const endpointResult = filePathToEndpoint(filePath);
        
        if (!endpointResult.success) {
          console.error(endpointResult.error);
          continue;
        }

        const endpoint = endpointResult.data;
        console.log(`Processing endpoint: "${endpoint}" from file: ${filePath}`);
        let methodsMounted = 0;
        
        // Check for each HTTP method in the module
        for (const method of supportedMethods) {
          if (typeof routeModule[method] === 'function') {
            const handler = routeModule[method];
            
            // Wrap handler with error handling
            const wrappedHandler = async (req, res, next) => {
              try {
                await handler(req, res, next);
              } catch (error) {
                console.error(`Error in ${method} ${endpoint}:`, error);
                
                if (!res.headersSent) {
                  res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    data: null
                  });
                }
              }
            };
            
            // Mount the route with the appropriate HTTP method
            try {
              switch (method.toLowerCase()) {
                case 'get':
                  app.get(endpoint, wrappedHandler);
                  break;
                case 'post':
                  app.post(endpoint, wrappedHandler);
                  break;
                case 'put':
                  app.put(endpoint, wrappedHandler);
                  break;
                case 'patch':
                  app.patch(endpoint, wrappedHandler);
                  break;
                case 'delete':
                  app.delete(endpoint, wrappedHandler);
                  break;
                case 'options':
                  app.options(endpoint, wrappedHandler);
                  break;
                case 'head':
                  app.head(endpoint, wrappedHandler);
                  break;
              }
              
              console.log(`✓ Mounted ${method} ${endpoint}`);
              mountedRoutes.push({ method, endpoint, file: filePath });
              methodsMounted++;
            } catch (routeError) {
              console.error(`✗ Failed to mount ${method} ${endpoint}:`, routeError.message);
            }
          }
        }
        
        if (methodsMounted === 0) {
          console.warn(`No HTTP methods found in ${filePath}`);
        }
        
      } catch (importError) {
        console.error(`Error loading route file ${filePath}:`, importError.message);
      }
    }
    
    return {
      success: true,
      error: null,
      data: {
        totalFiles: routeFiles.length,
        mountedRoutes: mountedRoutes.length,
        routes: mountedRoutes
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error mounting routes: ${error.message}`,
      data: null
    };
  }
}

/**
 * Starts the Express server with auto-mounted routes
 * @returns {Promise<{success: boolean, error: string|null, data: object}>}
 */
async function startServer() {
  try {
    // Mount all routes first
    const mountResult = await mountRoutes();
    
    if (!mountResult.success) {
      console.error('Failed to mount routes:', mountResult.error);
      return mountResult;
    }
    
    console.log(`Successfully mounted ${mountResult.data.mountedRoutes} routes from ${mountResult.data.totalFiles} files`);
    
    // Add a catch-all route for unmatched API endpoints
    app.use('/api', (req, res) => {
      // Only handle if no route matched
      res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        data: null
      });
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Auto-mounting routes from ./routes directory`);
      console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/*`);
    });
    
    return {
      success: true,
      error: null,
      data: {
        port: PORT,
        routes: mountResult.data.routes
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to start server: ${error.message}`,
      data: null
    };
  }
}

// Start the server
startServer().then(result => {
  if (!result.success) {
    console.error('Server startup failed:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('Unexpected error during startup:', error);
  process.exit(1);
});