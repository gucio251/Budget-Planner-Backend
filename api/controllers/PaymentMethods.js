import db from '../db/index'
import CRUD from './../crud/crud'
import Queries from './../queries/PaymentMethodsQueries'

const PaymentMethods = {
    async add(req, res){
        await CRUD.addOne(req, res, {
            name: 'Payment method',
            dbQuery: Queries.addPaymentQuery
        })
    },

    async delete(req, res) {
        await CRUD.deleteOne(req, res, {
            name: 'Payment method',
            selectQuery: Queries.selectPaymentQuery,
            deleteQuery: Queries.deletePaymentQuery
        })
    },

    async getAll(req, res) {
        await CRUD.getAll(req, res, {
            name: 'Payment method',
            property: 'name',
            selectAll: Queries.selectAllPaymentsQuery
        })
    },

    async update(req, res){
        await CRUD.update(req, res, {
            name: 'Payment method',
            selectQuery: Queries.selectPaymentQuery,
            updateQuery: Queries.updatePaymentQuery
        })
    }
}

export default PaymentMethods