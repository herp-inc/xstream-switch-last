const assert = require('assert');
const xs = require('xstream').default;
const switchLast = require('../index').default;
const delay = require('xstream/extra/delay').default;

const stream = xs.merge(
  xs.of(xs.periodic(100)),
  xs.of(1).compose(delay(350)).mapTo(xs.periodic(100).take(3).map(i => i + 10)),
)
.compose(switchLast);

const values = [];
stream.addListener({
  next: a => values.push(a),
  complete: () => assert.deepStrictEqual(values, [0,1,2,10,11,12])
});
