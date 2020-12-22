import db from '../db/index'
import CRUD from '../crud/crud'
import Queries from '../queries/CurrenciesQueries'

const PaymentMethods = {
    async add(req, res){
        await CRUD.addOne(req, res, {
            name: 'Currencies',
            dbQuery: Queries.addPaymentQuery
        })
    },

    async delete(req, res) {
        await CRUD.deleteOne(req, res, {
            name: 'Currencies',
            selectQuery: Queries.selectPaymentQuery,
            deleteQuery: Queries.deletePaymentQuery
        })
    },

    async getAll(req, res) {
        await CRUD.getAll(req, res, {
            name: 'Currencies',
            property: 'name',
            selectAll: Queries.selectAllCurrencies
        })
    },

    async update(req, res){
        await CRUD.update(req, res, {
            name: 'Currencies',
            selectQuery: Queries.selectPaymentQuery,
            updateQuery: Queries.updatePaymentQuery
        })
    }
}

export default PaymentMethods