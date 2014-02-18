/*jshint expr: true */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var _ = require('underscore');

var fx = require('./fixtures');

var BasalUtil = require('../js/data/basalutil');

var EPSILON = 0.00001;

var MS_IN_HOUR = 3600000.0;

fx.forEach(testData);

function testData (data) {
  var name = data.name;
  var basal = new BasalUtil(data.json);
  describe(name, function() {
    it('should be an array', function() {
      assert.isArray(data.json);
    });

    it('should be composed of objects', function() {
      data.json.forEach(function(d) {
        assert.typeOf(d, 'object');
      });
    });

    it('should be non-zero in length', function() {
      expect(data.json).to.have.length.above(0);
    });

    describe('basal.actual', function() {
      it('should be an array', function() {
        assert.typeOf(basal.actual, 'array');
      });

      it('should have a non-zero length', function() {
        expect(basal.actual).to.have.length.above(0);
      });

      it('should have a first segment with a start matching the first segment of input data', function() {
        var basals = _.where(data.json, {'type': 'basal-rate-segment'});
        expect(basal.actual[0].start).to.equal(basals[0].start);
      });

      it('should have a last segment with an end matching the last segment of input data', function() {
        var basals = _.where(data.json, {'type': 'basal-rate-segment'});
        var basalLength = basal.actual.length;
        expect(basal.actual[basalLength - 1].end).to.equal(basals[basals.length - 1].end);
      });

      it('should be sorted in sequence', function() {
        var sorted = _.sortBy(basal.actual, function(a) {
          return new Date(a.start).valueOf();
        });
        expect(sorted).to.eql(basal.actual);
      });

      it('should be contiguous from start to end', function() {
        var basalLength = basal.actual.length;
        expect(_.find(basal.actual, function(segment, i, segments) {
          if (i !== (basalLength - 1)) {
            return segment.end !== segments[i + 1].start;
          }
          else {
            return false;
          }
        })).to.be.undefined;
      });

      it('should not have any duplicates', function() {
        expect(_.uniq(basal.actual)).to.be.eql(basal.actual);
      });

      it('should have squashed contiguous identical segments', function() {
        var keysToOmit = ['id', 'start', 'end'];
        basal.actual.forEach(function(segment, i, segments) {
          if ((i < (segments.length - 1)) && segment.type === 'scheduled') {
            expect(_.omit(segment, keysToOmit)).to.not.eql(_.omit(segments[i + 1], keysToOmit));
          }
        });
      });
    });

    describe('basal.undelivered', function() {
      it('should be an array', function() {
        assert.typeOf(basal.undelivered, 'array', 'basal.undelivered is an array');
      });

      it('should have a non-zero length if there is a temp basal in the input data', function() {
        var temps = _.where(data.json, {'deliveryType': 'temp'});
        if (temps.length > 0) {
          expect(basal.undelivered.length).to.be.above(0);
        }
      });

      it('should be sorted in sequence', function() {
        var sorted = _.sortBy(basal.undelivered, function(a) {
          return new Date(a.start).valueOf();
        });
        expect(sorted).to.eql(basal.undelivered);
      });

      it('should not have any duplicates', function() {
        expect(_.uniq(basal.undelivered)).to.be.eql(basal.undelivered);
      });

      it('should have a total duration equal to the total duration of temp segments from the actual stream', function() {
        var tempDuration = 0;
        _.where(basal.actual, {'deliveryType': 'temp'}).forEach(function(segment) {
          tempDuration += Date.parse(segment.end) - Date.parse(segment.start);
        });
        var undeliveredDuration = 0;
        basal.undelivered.forEach(function(segment) {
          if (segment.deliveryType === 'scheduled') {
            undeliveredDuration += Date.parse(segment.end) - Date.parse(segment.start);
          }
        });
        expect(undeliveredDuration).to.equal(tempDuration);
      });
    });
  });
}

describe('totalBasal', function() {
  var template = new BasalUtil(_.findWhere(fx, {'name': 'template'}).json);
  var temp = new BasalUtil(_.findWhere(fx, {'name': 'contained'}).json);

  it('should be a function', function() {
    var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);
    assert.isFunction(basal.totalBasal);
  });

  it('should return 20.0 on basal-template.json for twenty-four hours', function() {
    var start = new Date("2014-02-12T00:00:00").valueOf();
    var end = new Date("2014-02-13T00:00:00").valueOf();
    expect(template.totalBasal(start, end)).to.be.closeTo(20.0, EPSILON);
  });

  it('should return 1.45 on basal-template.json from 1 to 3 a.m.', function() {
    var start = new Date("2014-02-12T01:00:00").valueOf();
    var end = new Date("2014-02-12T03:00:00").valueOf();
    expect(template.totalBasal(start, end)).to.be.closeTo(1.45, EPSILON);
  });

  it('should return 5.35 on basal-contained.json from 8:30 a.m. to 3:30 p.m.', function() {
    var start = new Date("2014-02-12T08:30:00").valueOf();
    var end = new Date("2014-02-12T15:30:00").valueOf();
    expect(temp.totalBasal(start, end)).to.be.closeTo(5.35, EPSILON);
  });
});

describe('segmentDose', function() {
  var basal = new BasalUtil(_.findWhere(fx, {'name': 'current-demo'}).json);

  it('should be a function', function() {
    assert.isFunction(basal.segmentDose);
  });

  it('should return 1.0', function() {
    expect(basal.segmentDose(MS_IN_HOUR, 1)).to.be.closeTo(1.0, EPSILON);
  });

  it('should return 1.2', function() {
    expect(basal.segmentDose(MS_IN_HOUR * 1.5, 0.8)).to.be.closeTo(1.2, EPSILON);
  });
});