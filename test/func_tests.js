var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

describe('API ROUTING FOR /api/threads/:board', function() {
    
  describe('POST', function() {
    it('posting thread', function(done) {
      chai
        .request(server)
        .post('/api/threads/:board')
        .send({
          board: 'general',
          text: 'mocha testing',
          delete_password: 'mocha testing password'
        })
        .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "text/html");

        done()
        })
    })

    
  });
  
  describe('GET', function() {

    
  });
  /*
  describe('DELETE', function() {
    
  });
  
  describe('PUT', function() {
    
  });
  
  */
});

/*
describe('API ROUTING FOR /api/replies/:board', function() {
  
  describe('POST', function() {
    
  });
  
  describe('GET', function() {
    
  });
  
  describe('PUT', function() {
    
  });
  
  describe('DELETE', function() {
    
  });
  
});
*/