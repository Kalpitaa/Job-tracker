const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.message);  // add this line
  console.error('STACK:', err.stack); 

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

export default errorHandler;