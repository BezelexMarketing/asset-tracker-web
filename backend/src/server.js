const app = require('./app');
const { initializeDatabase } = require('./config/database');

async function startServer() {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');
    await initializeDatabase();
    console.log('Database connection established successfully');

    // Start the server
    const PORT = process.env.PORT || 3001; // Changed to 3001 to avoid conflict with frontend
    app.listen(PORT, () => {
      console.log(`🚀 Asset Tracker Pro API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available API Endpoints:');
        console.log('  Authentication:');
        console.log('    POST /api/auth/login');
        console.log('    GET  /api/auth/validate');
        console.log('    POST /api/tenants (super admin)');
        console.log('\n  NFC Operations:');
        console.log('    GET  /api/nfc/:tagId/lookup');
        console.log('    POST /api/nfc/:tagId/assign');
        console.log('    POST /api/nfc/:tagId/checkin');
        console.log('    POST /api/nfc/:tagId/checkout');
        console.log('    POST /api/nfc/:tagId/maintenance');
        console.log('\n  Items Management:');
        console.log('    GET  /api/items');
        console.log('    GET  /api/items/:id');
        console.log('    POST /api/items');
        console.log('    PUT  /api/items/:id');
        console.log('    DELETE /api/items/:id');
        console.log('\n  Operators Management:');
        console.log('    GET  /api/operators');
        console.log('    GET  /api/operators/:id');
        console.log('    POST /api/operators');
        console.log('    PUT  /api/operators/:id');
        console.log('    DELETE /api/operators/:id');
        console.log('\n  Assignments Management:');
        console.log('    GET  /api/assignments');
        console.log('    GET  /api/assignments/:id');
        console.log('    POST /api/assignments');
        console.log('    PUT  /api/assignments/:id');
        console.log('    DELETE /api/assignments/:id');
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  // Close database connections
  const { closeDatabase } = require('./config/database');
  closeDatabase()
    .then(() => {
      console.log('Database connections closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error closing database connections:', error);
      process.exit(1);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };