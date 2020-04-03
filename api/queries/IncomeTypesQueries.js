import db from './../db/index'

const Queries = {
    selectAllIncomesTypesQuery(req) {
        const selectAll = 'SELECT name FROM budget.incomes_category_assigned_to_user WHERE user_id = $1'
        const queryValues = [req.user.id]
        return db.query(selectAll, queryValues)
    },

    addOneIncomeTypeQuery(req){
        const addQuery = 'INSERT INTO budget.incomes_category_assigned_to_user VALUES (DEFAULT, $1, $2) RETURNING *'
        const queryValues = [
            req.user.id,
            req.body.name
        ]
        return db.query(addQuery, queryValues)
    },

    selectIncomeTypeQuery(req) {
        const selectQuery = 'SELECT * FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(selectQuery, queryValues)
    },

    updateIncomeQuery(req) {
        const updateQuery = 'UPDATE budget.incomes_category_assigned_to_user SET name = $1 WHERE id = $2'
        const queryValues = [
            req.body.name,
            req.params.id
        ]
        return db.query(updateQuery, queryValues)
    },

    deleteIncomeQuery(req) {
        const deleteQuery = 'DELETE FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(deleteQuery, queryValues)
    }
}

export default Queries