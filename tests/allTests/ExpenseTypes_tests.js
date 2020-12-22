import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../index'

chai.use(chaiHttp)
chai.should()

let userToken

const userData = {
    login: 'test12',
    password: 'test'
}

const expenseType = {
    name: 'testowyWydatek',
    updatedName: 'nowyTestowyWydatek'
}

describe('testing expense types', () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
            })
    })

    it('shall return all expense types available', (done) => {
        chai.request(app)
            .get('/api/expenseTypes')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('result')
                res.body.result.should.be.an('array')
                done()
            })
    })

    it('shall add single expense' , (done) => {
        chai.request(app)
            .post('/api/expenseTypes')
            .set('Authorization', userToken)
            .send({name: expenseType.name})
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense type has been successfully added')
                expenseType.id = res.body.result
                done()
            })
    })

    it('shall update single expense', (done) => {
        chai.request(app)
            .put(`/api/expenseTypes/${expenseType.id}`)
            .set('Authorization', userToken)
            .send({
                name: expenseType.updatedName
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('object')
                res.body.should.have.property('message').eql('Expense type has been successfully updated')
                done()
            })
    })

    it('shall delete single expense type', (done) => {
        chai.request(app)
            .delete(`/api/expenseTypes/${expenseType.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense type has been successfully deleted')
                done()
            })
    })

    it('shall not delete single expense because name is unknown', (done) => {
        chai.request(app)
            .delete(`/api/expenseTypes/${expenseType.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense type has not been found in Database')
                done()
            })
    })
})