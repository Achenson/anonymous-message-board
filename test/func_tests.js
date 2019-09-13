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

        //dodać replies. properties tests!

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


describe('API ROUTING FOR /api/replies/:board', function() {
  
  
  describe('POST', function() {
    it('posting reply', function(done) {
      chai
        .request(server)
        .post('/api/replies/:board')
        .send({
          board: 'new board',
          thread_id: '5d7b7f46a41a551cb8309851',
          text: 'mocha reply',
          delete_password: 'mocha reply'
      
         
        })
        .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "text/html");

        done()
        })
    })

    
  });
  
  //works
  describe('GET', function() {
    it('board: getting threads with all replies', function(done) {
      chai
        .request(server)
        .get('/api/replies/new board?thread_id=5d7a4d94acb7762194502de0')
        .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        

        assert.notProperty(res.body.replies[0], 'delete_password');
        assert.notProperty(res.body.replies[0], 'reported');

        assert.property(res.body.replies[0], '_id');
        assert.property(res.body.replies[0], 'created_on');
       
        assert.property(res.body.replies[0], 'text');
           

        










        done()
        })
    })



    
  });
  
  /*
  describe('PUT', function() {
    
  });
  
  describe('DELETE', function() {
    
  });
  */
});
