const jwt = require('jsonwebtoken');

function decodeTokenFromHeader(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

function authRequired(req, res, next) {
  const payload = decodeTokenFromHeader(req);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.userId = payload.id;
  req.isAdmin = payload.isAdmin;
  next();
}

function adminRequired(req, res, next) {
  const payload = decodeTokenFromHeader(req);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!payload.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.userId = payload.id;
  req.isAdmin = true;
  next();
}

module.exports = { authRequired, adminRequired };
