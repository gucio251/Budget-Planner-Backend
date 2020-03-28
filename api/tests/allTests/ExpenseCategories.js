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
            .get('/api/expenseCategories')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('allExpenseTypes')
                res.body.allExpenseTypes.should.be.an('array')
                done()
            })
    })

    it('shall add single expense' , (done) => {
        chai.request(app)
            .post('/api/expenseCategories')
            .set('Authorization', userToken)
            .send({name: 'testowyWydatek'})
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense has been successfully added')
                done()
            })
    })

    it('shall update single expense', (done) => {
        chai.request(app)
            .put('/api/expenseCategories')
            .set('Authorization', userToken)
            .send({
                newName: 'nowyTestowyWydatek',
                oldName: 'testowyWydatek'
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('object')
                res.body.should.have.property('message').eql('testowyWydatek has been successfully updated to nowyTestowyWydatek')
                done()
            })
    })

    it('shall not update single expense because old does not exist', (done) => {
        chai.request(app)
            .put('/api/expenseCategories')
            .set('Authorization', userToken)
            .send({
                newName: 'nowyTestowyWydatek',
                oldName: 'testowyWydatek11'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('There is no Expense Category to modify')
                done()
            })
    })

    it('shall delete single expense', (done) => {
        chai.request(app)
            .delete('/api/expenseCategories')
            .set('Authorization', userToken)
            .send({name: 'nowyTestowyWydatek'})
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('nowyTestowyWydatek has been successfully deleted')
                done()
            })
    })

    it('shall not delete single expense because name is unknown', (done) => {
        chai.request(app)
            .delete('/api/expenseCategories')
            .set('Authorization', userToken)
            .send({name: 'nowyTestowyWydatekxxx'})
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('There is no Expense Category to modify')
                done()
            })
    })
})