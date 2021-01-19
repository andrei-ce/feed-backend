const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async (req, res, next) => {
  //Get the token from header
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('No token in headers');
    error.statusCode = 401;
    next(error);
  }

  const token = authHeader.split(' ')[1];

  //Check if no token
  if (!token) {
    const error = new Error('No token, no access');
    error.statusCode = 401;
    next(error);
  }
  //Verify token
  try {
    jwt.verify(token, config.get('JWT_SECRET'), (error, decoded) => {
      if (error) {
        error.statusCode = 401;
        next(error);
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  } catch (err) {
    error.statusCode = 500;
    next(error);
  }
};

// module.exports = (req, res, next) => {
//   const authHeader = req.get('Authorization');
//   if (!authHeader) {
//     const error = new Error('Not authenticated.');
//     error.statusCode = 401;
//     throw error;
//   }
//   const token = authHeader.split(' ')[1];
//   let decodedToken;
//   try {
//     decodedToken = jwt.verify(token, config.get('JWT_SECRET'));
//   } catch (err) {
//     err.statusCode = 500;
//     throw err;
//   }
//   if (!decodedToken) {
//     const error = new Error('Not authenticated.');
//     error.statusCode = 401;
//     throw error;
//   }
//   req.userId = decodedToken.userId;
//   next();
// };
