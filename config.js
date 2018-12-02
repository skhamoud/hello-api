const env = process.env.NODE_ENV;
const config = {
  dev : {
    name: 'dev',
    httpPort: 3000,
    httpsPort: 3002,
  },
  production: {
    name: 'production',
    httpPort: 5000,
    httpsPort: 5002,
  }
};

// use dev configuration by default
module.exports = config[env] ? config[env] : config.dev ;