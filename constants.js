const COOKIE_NAME = 'qid';
const __prod__ = process.env.NODE_ENV === 'production';

module.exports = {
  COOKIE_NAME,
  __prod__,
};
