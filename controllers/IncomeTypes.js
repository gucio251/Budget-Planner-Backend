import db from '../db/index'
import CRUD from './../crud/crud'
import Queries from './../queries/IncomeTypesQueries'

const IncomeCategories = {
    async getAll(req, res){
        await CRUD.getAll(req, res, {
            name: "Income type",
            property: "name",
            selectAll: Queries.selectAllIncomesTypesQuery
        })
    },

    async add(req, res){
        await CRUD.addOne(req, res, {
            name: "Income type",
            dbQuery: Queries.addOneIncomeTypeQuery
        })
    },

    async update(req, res){
        await CRUD.update(req, res, {
            name: 'Income Type',
            selectQuery: Queries.selectIncomeTypeQuery,
            updateQuery: Queries.updateIncomeQuery
        })
    },

    async delete(req, res) {
        await CRUD.deleteOne(req, res, {
            name: 'Income Type',
            selectQuery: Queries.selectIncomeTypeQuery,
            deleteQuery: Queries.deleteIncomeQuery
        })
    },
}

export default IncomeCategories