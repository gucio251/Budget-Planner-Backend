import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../index'
import db from '../../db/index'

chai.use(chaiHttp)
chai.should()

var expect = chai.expect

let userToken

const userData = {
    login: 'test12',
    password: 'test'
}

const Expense = {
    type: 'paliwo',
    wrong_type: 'wrong',
    payment_type: 'karta debetowa',
    wrong_payment_type: 'wrong',
    amount: 200,
    wrong_amount: 'das',
    date: new Date(2020,2,17),
    wrong_date: 'heheh',
    comment: 'testowy komentarz'
}

const newExpense = {
    type: 'rachunki',
    payment_type: 'karta kredytowa',
    not_existing_payment_type: 'nie istnieje',
}

describe('expense features testing', () => {
    before((done) => {
        chai.request(app)
            .post('/api/signin')
            .send(userData)
            .end((err, res) => {
                userToken = `Bearer ${res.body.token}`
                done()
            })
    })

    it('shall add expense with status 200', (done) => {
        chai.request(app)
            .post('/api/expenses')
            .set('Authorization', userToken)
            .send({
                type: Expense.type,
                payment_type: Expense.payment_type,
                amount: Expense.amount,
                date: Expense.date,
                comment: Expense.comment
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense has been successfully added')
                Expense.id = res.body.insertId
                done()
            })
    }),

    it('shall reject request due to payment type incorrectness', (done) => {
        chai.request(app)
            .post('/api/expenses')
            .set('Authorization', userToken)
            .send({
                type: Expense.type,
                payment_type: Expense.wrong_payment_type,
                amount: Expense.amount,
                date: Expense.date,
                comment: Expense.comment
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`Expense has not been added. ${Expense.wrong_payment_type} is not registered as payment type`)
                done()
            })
    }),

    it('shall reject request due to expense type incorrectness', (done) => {
        chai.request(app)
            .post('/api/expenses')
            .set('Authorization', userToken)
            .send({
                type: Expense.wrong_type,
                payment_type: Expense.payment_type,
                amount: Expense.amount,
                date: Expense.date,
                comment: Expense.comment
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql(`Expense has not been added. ${Expense.wrong_type} is not registered as expense type`)
                done()
            })
    }),

    it('shall reject request due to amount is as string', (done) => {
        chai.request(app)
            .post('/api/expenses')
            .set('Authorization', userToken)
            .send({
                type: Expense.type,
                payment_type: Expense.payment_type,
                amount: Expense.wrong_amount,
                date: Expense.date,
                comment: Expense.comment
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message')
                done()
            })
    }),

    it('shall reject request due to date is in wrong format', (done) => {
        chai.request(app)
            .post('/api/expenses')
            .set('Authorization', userToken)
            .send({
                type: Expense.type,
                payment_type: Expense.payment_type,
                amount: Expense.amount,
                date: Expense.wrong_date,
                comment: Expense.comment
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message')
                done()
            })
    }),

    it('shall be updated successfully with status 200', (done) => {
        chai.request(app)
            .put(`/api/expenses/${Expense.id}`)
            .set('Authorization', userToken)
            .send({
                newType: newExpense.type,
                newPayment: newExpense.payment_type
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('Expense has been successfully updated')
                done()
            })
    }),

    it('shall be rejected due to fact that payment type is not registered for user', (done) => {
        chai.request(app)
            .put(`/api/expenses/${Expense.id}`)
            .set('Authorization', userToken)
            .send({
                oldType: newExpense.type,
                oldPayment: newExpense.payment_type,
                oldAmount: Expense.amount,
                oldDate: Expense.date,
                newType: newExpense.type,
                newPayment: newExpense.not_existing_payment_type
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('ExpenseType or/and PaymentType have not been assigned to user')
                done()
            })
    }),

    it('shall return all registered expenses for user, status 200', (done) => {
        chai.request(app)
            .get('/api/expenses/20200118/20200320')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('result')
                res.body.result.should.be.an('array')
                done()
            })
    }),

    it('shall return all registered expenses for user grouped by type, status 200', (done) => {
        chai.request(app)
            .get('/api/expenses/sorted/20200118/20200320')
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('result')
                res.body.result.should.be.an('array')
                expect(res.body.result).to.deep.include.members([{expense_type: 'rachunki', sum: 200}])
                done()
            })
    }),

    it('shall delete Expense with given id', (done) => {
        chai.request(app)
            .delete(`/api/expenses/${Expense.id}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('message').eql('User has been successfully deleted')
                done()
            })
    })
})

