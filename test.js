const app = require('./app');
const chaiHttp = require('chai-http');
const chai = require('chai');

chai.use(chaiHttp);
chai.should();

describe('GET /closestStore', () => {
  const requester = chai.request(app).keepOpen();

  after(() => {
    requester.close();
  })

  it('should get status 200 and an array', (done) => {
    requester
      .get('/closestStore/bloor st w and dundas st w toronto ontario/20/Y')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.stores.should.be.a('array');
        done();
      });
  });

  it('should get the closest 20 stores, closest is Loblaws', (done) => {
    requester
      .get('/closestStore/bloor st w and dundas st w toronto ontario/20/Y')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.stores.should.be.a('array');
        res.body.stores.length.should.equal(20);
        res.body.stores[0].name.should.equal("LOBLAWS");
        done();
      });
  });
});