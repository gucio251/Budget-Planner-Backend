import chai from 'chai'
import chaiHttp from 'chai-http'
import app from './../../index'
import db from './../../db/index'

chai.use(chaiHttp)
chai.should()

let userToken

const userData = {
    login: 'test12',
    password: 'test'
}

const incomeCategory = {
    name: 'testowa',
    updatedName: 'testowaNowa'
}

describe('Testing Expense Categories', () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
            })
    })

    it('shall return all incomeCategories available for user, status 200', (done) => {
        chai.request(app)
            .get('/api/incomeCategories')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('result')
                res.body.result.should.be.an('array')
                res.body.result.should.have.lengthOf(4)
                done()
            })
    }),

    it('shall successfully add incomeCategory, status 200', (done) => {
        chai.request(app)
            .post('/api/incomeCategories')
            .send({name: incomeCategory.name})
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`${incomeCategory.name} has been successfully added`)
                res.body.should.have.property('result')
                incomeCategory.id = res.body.result
                done()
            })
    }),

    it('shall successfully update income category, status 200', (done) => {
        chai.request(app)
            .put(`/api/incomeCategories/${incomeCategory.id}`)
            .send({
                name: incomeCategory.updatedName,
                oldIncomeId: incomeCategory.id
            })
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`${incomeCategory.name} has been successfully updated to ${incomeCategory.updatedName}`)
                done()
            })
    }),

    it('shall successfully delete income category, status 200', (done) => {
        chai.request(app)
            .delete(`/api/incomeCategories/${incomeCategory.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`Income category has been successfully deleted`)
                done()
            })
    })
})