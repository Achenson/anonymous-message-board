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
    it('board: getting 10 threads with 3 replies', function(done) {
      chai
        .request(server)
        .get('/api/threads/new board/')
        .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.isAtMost(res.body.length, 10);

        assert.notProperty(res.body[0], 'delete_password');
        assert.notProperty(res.body[0], 'reported');

        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'bumped_on');
        assert.property(res.body[0], 'text');
        assert.property(res.body[0], 'replies'); 
        assert.property(res.body[0], 'board');   

        assert.isAtMost(res.body[0].replies.length, 3);










        done()
        })
    })


    
  });
  /*
  describe('DELETE', function() {
    
  });
  */

  
  describe('PUT', function() {
    it('PUT - reporting thread', function(done) {
      chai
        .request(server)
        .put('/api/threads/:board')
        .send({
          
          board: 'new board',
          thread_id: '5d7b820f9a2ad21bc8794a7f',
          delete_password: 'for mocha'
        })
        .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "text/html");
        assert.equal(res.text, 'reported')

        done()
        })
    })

    
  });
  
  
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