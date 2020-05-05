const { Pool } = require('pg');

DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL
});

// a generic query, that executes all queries you send to it
function query(text, values = []) {
  return new Promise((resolve, reject) => {
    pool.query(text, values)
      .then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  query
};
