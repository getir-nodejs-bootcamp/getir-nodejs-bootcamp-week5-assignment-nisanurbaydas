module.exports = (error, req, res, next) => {
    // console.log('Error middleware calisti...');
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message || 'Internal Server Error....',
      },
    });
  }