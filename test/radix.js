var expect = global.expect = require('./expect')

var Radix = require('../lib/radix')
var _ = String.fromCharCode(29)

describe('Radix', function () {
  it('read', function () {
    var rad = Radix()
    rad('asdf.pub', 'yum')
    rad('ablah', 'cool')
    rad('node/circle.bob', 'awesome')

    expect(rad('asdf.')).to.be.eql({pub: {'\u001e': 'yum'}})
    expect(rad('nv/foo.bar')).to.be(undefined)
  })
})
