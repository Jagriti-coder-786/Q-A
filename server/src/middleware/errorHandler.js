export function errorHandler(err, req, res, next) {
  console.error('❌ [API Error]:', err.stack || err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        errorType: 'FILE_TOO_LARGE',
        message: 'This file exceeds the 50MB size limit. Please compress it or select a smaller file.',
        actionableHelp: 'Try reducing embedded images or splitting large documents.'
      });
    }
    return res.status(400).json({
      success: false,
      errorType: 'UPLOAD_FAILED',
      message: 'We encountered an issue while uploading your file. Please try again.',
      actionableHelp: 'Check your network connection and retry the upload.'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      errorType: 'VALIDATION_ERROR',
      message: err.message || 'One or more fields provided were invalid. Please review your input.'
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    errorType: 'SERVER_ERROR',
    message: err.message || 'Something unexpected occurred while processing your request. Please retry.',
    actionableHelp: 'If the problem persists, please check your network or try refreshing the page.'
  });
}
