import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../index'
import db from '../../db/index'

chai.use(chaiHttp)
chai.should()
let expect = chai.expect

let userToken

const userData = {
    login: 'test12',
    password: 'test'
}

const Income = {
    type: "zwrot",
    amount: 200,
    date: new Date(2020, 2, 17),
    comment: "TestComment",
    newType: "wynajem",
    newAmount: 222
}

describe('Incomes features testing', () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
        })
    })

    it('shall add successfully income, status 200', (done) => {
        chai.request(app)
            .post('/api/incomes')
            .set('Authorization', userToken)
            .send({
                type: Income.type,
                amount: Income.amount,
                date: Income.date,
                comment: Income.comment
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('result')
                res.body.should.have.property('message')
                Income.id = res.body.result
                done()
            })
    })

    it('shall successfully return all incomes assigned to user, status 200', (done) => {
        chai.request(app)
            .get(`/api/incomes/20200316/20200320`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('results')
                res.body.results.should.be.an('array')
                done()
            })
    })

    it('shall successfully update income based on ID, status 200', (done) => {
        chai.request(app)
            .put(`/api/incomes/${Income.id}`)
            .set('Authorization', userToken)
            .send({
                type: Income.newType,
                amount: Income.newAmount
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Income has been successfully updated')
                done()
            })
    })

    it('shall successfully return all incomes sorted by type, status 200', (done) => {
        chai.request(app)
            .get('/api/incomes/sorted/20200316/20200320')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('results')
                res.body.results.should.be.an('array')
                expect(res.body.results).to.have.lengthOf(1)
                expect(res.body.results).to.deep.include.members([{ income_type: 'wynajem', sum: 222 }])
                done()
            })
    }),

    it('shall successfully remove income with given ID, status 200', (done) => {
        chai.request(app)
            .delete(`/api/incomes/${Income.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Income has been successfully deleted')
                done()
            })

    })
})