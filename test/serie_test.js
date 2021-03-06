'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const moment = require('moment');
chai.use(chaiAsPromised);
var expect = chai.expect;

const Cojascli = require('../lib');
const occurences = 100;

describe('#chartSerie tests', function() {
  it('Should not be able to create a serie without a name', function() {
    expect(() => {
      new Cojascli.Serie({});
    }).to.throw('Missing name');
  });
  it(
    'Should be able to store ' + occurences + ' points without problem',
    function() {
      let serie = new Cojascli.Serie({ name: 'Test' });
      for (let index = 0; index < occurences; index++) {
        serie.setDataPoint({ x: index, y: index });
      }
      let res = serie.get();
      expect(res.points.length).to.equal(occurences);
    }
  );
  it('Should populate the missing values with the option fillNullDateValues', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { fillNullDateValues: true },
    });
    let startDay = moment().subtract(9, 'days');
    let endDay = moment();
    serie.setDataPoint({ x: startDay, y: 0 });
    serie.setDataPoint({ x: endDay, y: 3 });
    let res = serie.get();
    //console.log(res);
    expect(res.points).to.be.an('array') &&
      expect(res.points.length).to.equal(10);
  });
  it('With the option fillNullDateValues and sorted by date, last value should be of the end Date', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { fillNullDateValues: true, sort: true, order: 'date' },
    });
    let startDay = moment().subtract(9, 'days');
    let endDay = moment();
    serie.setDataPoint({ x: startDay, y: 0 });
    serie.setDataPoint({ x: endDay, y: 345 });
    let res = serie.get();
    expect(res.points).to.be.an('array') &&
      expect(res.points[9]['y']).to.equal(345);
  });
  it('Should add all values with cumulative type', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { cumulative: true },
    });
    serie.setDataPoint({ x: '1', y: 2 });
    serie.setDataPoint({ x: '2', y: 3 });
    serie.setDataPoint({ x: '3', y: 123 });
    let res = serie.get();
    expect(res.points[2].y).to.equal(128);
  });
  it('Should group values with grouped type', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { grouped: true },
    });
    serie.setDataPoint({ x: '1', y: 2 });
    serie.setDataPoint({ x: '1', y: 3 });
    serie.setDataPoint({ x: '1', y: 123 });
    serie.setDataPoint({ x: '2', y: 12 });
    let res = serie.get();
    expect(res.points[0].value).to.equal(128);
  });
  it('Should sort points alphanumerically', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { sort: true, order: 'alpha', direction: 'ASC' },
    });
    serie.setDataPoint({ x: 'r', y: 2 });
    serie.setDataPoint({ x: 'z', y: 3 });
    serie.setDataPoint({ x: 'd', y: 123 });
    serie.setDataPoint({ x: 'p', y: 12 });
    let res = serie.get();
    expect(res.points[0].value).to.equal(123);
  });
  it('Should sort points numerically', function() {
    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { sort: true, direction: 'ASC' },
    });
    serie.setDataPoint({ x: 5, y: 2 });
    serie.setDataPoint({ x: 111, y: 3 });
    serie.setDataPoint({ x: 2, y: 123 });
    serie.setDataPoint({ x: 7, y: 12 });
    let res = serie.get();
    expect(res.points[0].value).to.equal(123);
  });
  it('Should sort points by date', function() {
    let serie = new Cojascli.Serie({
      name: 'Test Date',
      options: { sort: true, order: 'date', direction: 'ASC' },
    });
    serie.setDataPoint({ x: moment('2019-06-12', 'YYYY-MM-DD'), y: 2 });
    serie.setDataPoint({ x: moment('2019-05-11', 'YYYY-MM-DD'), y: 3 });
    serie.setDataPoint({ x: moment('2019-04-12', 'YYYY-MM-DD'), y: 123 });
    serie.setDataPoint({ x: moment('2019-06-1', 'YYYY-MM-DD'), y: 12 });
    let res = serie.get();
    expect(res.points[0].value).to.equal(123);
    expect(res.points[1].value).to.equal(3);
  });
  it('Should sort points according to a function', function() {
    // TODO

    let serie = new Cojascli.Serie({
      name: 'Test',
      options: { sort: true, order: sortFunction, direction: 'ASC' },
    });

    serie.setDataPoint({ x: 'Very Good 10', y: 87 });
    serie.setDataPoint({ x: 'Not Good 1', y: 2 });
    serie.setDataPoint({ x: '7', y: 15 });
    serie.setDataPoint({ x: '6', y: 13 });
    serie.setDataPoint({ x: '4', y: 123 });
    serie.setDataPoint({ x: '5', y: 12 });
    let res = serie.get();
    expect(res.points[0].value).to.equal(2);
    expect(res.points[1].value).to.equal(123);
    expect(res.points[5].value).to.equal(87);
  });

  it('Should not give a label when there is none', function() {
    let serie = new Cojascli.Serie({
      name: 'Test Date',
    });
    serie.setDataPoint({ x: 1, y: 2 });
    serie.setDataPoint({ x: 2, y: 30 });
    let res = serie.get();
    expect(res.points[0].label).to.equal(undefined);
  });
  it('Should keep the label when there is', function() {
    let serie = new Cojascli.Serie({
      name: 'Test Date',
    });
    serie.setDataPoint({ x: 1, y: 2, label: 'toto' });
    serie.setDataPoint({ x: 2, y: 30, label: 'maurice' });
    let res = serie.get();
    expect(res.points[1].label).to.equal('maurice');
  });
});

function sortFunction(elt) {
  if (elt.x.includes('Not')) return 1;
  else if (elt.x.includes('Very')) return 10;
  else return parseInt(elt.x);
}
