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

const paymentMethodValues = {
    new: 'nowaMetoda',
    updated: 'updatedNowaMetoda'
}

describe('Testing payment methods', () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
            })
    })

    it('shall add single payment method with status 200', (done) => {
        chai.request(app)
            .post('/api/paymentMethods')
            .set('Authorization', userToken)
            .send({name: paymentMethodValues.new})
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`Payment method has been successfully added`)
                res.body.should.have.property('result')
                paymentMethodValues.id = res.body.result
                done()
            })
    }),

    it('shall updated name based on id, status 200', (done) => {
        chai.request(app)
            .put(`/api/paymentMethods/${paymentMethodValues.id}`)
            .set('Authorization', userToken)
            .send({ name: paymentMethodValues.updated})
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`Payment method has been successfully updated`)
                done()
            })
    }),

    it('shall delete payment method based on id', (done) => {
        chai.request(app)
            .delete(`/api/paymentMethods/${paymentMethodValues.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('Object')
                res.should.be.json
                res.body.should.have.property('message').eql(`Payment method has been successfully deleted`)
                done()
            })
    }),

    it('shall return array with all payment methods for user', (done) => {
        chai.request(app)
            .get('/api/paymentMethods/all')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.an('Object')
                res.should.be.json
                res.body.result.should.be.an('Array')
                res.body.should.have.property('result')
                done()
            })
    })
})