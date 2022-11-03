const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000, // try to reconnect every second if connection is lost
});

// Make a dublicate of the redis client to
const sub = redisClient.duplicate();

// Making the code slow on purpose to "justify" a separate worker process
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// Subscription
sub.on('message', (channel, message) => {
  // Insert the fibonacci value as a hash called "values" 
  // "message" is the index value submitted via the form
  redisClient.hset('values', message, fib(parseInt(message)));
});

/* Anytime a new value is inserted into Redis, we get the value, calculate the Fibonacci value and put it back into the Redis instance. */
sub.subscribe('insert');
