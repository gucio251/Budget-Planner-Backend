import db from '../db'
import CRUD from './../crud/crud'
import Queries from './../queries/ExpenseTypesQueries'

const ExpenseTypes = {
    async getAll(req, res){
        await CRUD.getAll(req, res, {
            name: 'Expense type',
            property: 'name',
            selectAll: Queries.selectAllExpensesTypesQuery
        })
    },

    async add(req, res){
        await CRUD.addOne(req, res, {
            name: 'Expense type',
            dbQuery: Queries.addOneExpenseTypeQuery
        })
    },

    async update(req, res){
        await CRUD.update(req, res, {
            name: 'Expense type',
            selectQuery: Queries.selectExpenseTypeQuery,
            updateQuery: Queries.updateExpenseTypeQuery
        })
    },

    async delete(req, res){
        await CRUD.deleteOne(req, res, {
            name: 'Expense type',
            selectQuery: Queries.selectExpenseTypeQuery,
            deleteQuery: Queries.deleteExpenseTypeQuery
        })
    }
}

export default ExpenseTypes