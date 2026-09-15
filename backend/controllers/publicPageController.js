export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 BUCoSA Platform API is online and healthy.',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
  console.log(`Server home/root request has been reached`);
};