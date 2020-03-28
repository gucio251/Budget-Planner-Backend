import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../index'
import db from '../../db/index'

chai.use(chaiHttp)
chai.should()

let userToken
const userData = {
    login: 'test12',
    password: 'test'
}

describe('Signup/Signin features testing', () => {
    before((done) => {
        db.query("DELETE FROM budget.users WHERE login = 'test12'")
        done()
    })
    it('shall return error msg due to the fact that email is missing in request', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send({
                login: 'xxx',
                password: 'yyy'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property('message')
                res.body.should.be.an('object')
                done()
            })
    })

    it('shall return token and status 201 for successfull user registration', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send({
                login: "test12",
                password: "test",
                email: "test@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.an('object')
                res.body.should.have.property('token')
                done()
            })
    })

    it('shall reject request due to the fact that email is already registered', (done) => {
        chai.request(app)
            .post('/api/signup')
            .send({
                login: "test1",
                password: "test",
                email: "test@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.an('object')
                res.body.should.have.property('message')
                done()
            })
    })

    it('shall reject request due to the fact that password is not given', (done) => {
        chai.request(app)
            .post('/api/signin')
            .send({
                login: "test1"
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.an('object')
                res.body.should.have.property('message').eql('There is login/password missing')
                done()
            })
    })

    it('shall return token', (done) => {
        chai.request(app)
            .post('/api/signin')
            .send({
                login: "test12",
                password: "test"
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.should.be.an('object')
                res.body.should.have.property('token')
                done()
            })
    })

    it('shall return 400 because user does not exist in DB', (done) => {
        chai.request(app)
            .post('/api/signin')
            .send({
                login: "test1223",
                password: "wrongPassword"
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.have.property('message').eql('test1223 does not exist in database')
                done()
            })
    })

    it('shall return 400 because password is incorrect', (done) => {
        chai.request(app)
            .post('/api/signin')
            .send({
                login: "test12",
                password: "wrongPassword"
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.have.property('message').eql('Given password is incorrect')
                done()
            })
    })
})

describe('another features on users' , () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
            })
    })

    beforeEach(() => {
        return db.query('START TRANSACTION')
    })

    afterEach(() => {
        return db.query('ROLLBACK')
    })

    it('shall return successfully updated user data', (done) => {
        chai.request(app)
            .put('/api/users/me')
            .set('Authorization', userToken)
            .send({
                email: 'testowyUpdated@gmail.com'
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.have.property('message').eql('User has been successfully updated')
                res.body.data.should.have.property('login').eql('test12')
                res.body.data.should.have.property('email').eql('testowyUpdated@gmail.com')
                done()
            })
    })

    it('shall return 400 because given password is wrong', (done) => {
        chai.request(app)
            .put('/api/users/me/password')
            .set('Authorization', userToken)
            .send({
                prevPassword: 'wrongPassword',
                newPassword: 'heheszki'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Given old password is incorrect')
                done()
            })
    })

    it('shall return 200 and message that password has been successfully updated', (done) => {
        chai.request(app)
            .put('/api/users/me/password')
            .set('Authorization', userToken)
            .send({
                prevPassword: 'test',
                newPassword: 'test12'
            })
            .end((err, res) =>{
                res.should.have.status(200)
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Password has been successfully updated')
                done()
            })
    })

    it('shall return 200 and message that account has been successfully deleted', (done) => {
        chai.request(app)
            .delete('/api/users/me')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Account has been deleted')
                done()
            })
    })

    it('shall return 200 and user login and email', (done) => {
        chai.request(app)
            .get('/api/users/me')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('Object')
                res.body.should.have.property('login').eql('test12')
                res.body.should.have.property('email').eql('test@gmail.com')
                done()
            })
    })
})