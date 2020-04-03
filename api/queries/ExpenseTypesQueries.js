import db from './../db/index'

const Queries = {
    selectAllExpensesTypesQuery(req) {
        const selectAll = 'SELECT name FROM budget.expenses_category_assigned_to_user WHERE user_id = $1'
        const queryValues = [req.user.id]
        return db.query(selectAll, queryValues)
    },

    addOneExpenseTypeQuery(req) {
        const addQuery = 'INSERT INTO budget.expenses_category_assigned_to_user VALUES (DEFAULT, $1, $2) RETURNING *'
        const queryValues = [
            req.user.id,
            req.body.name
        ]
        return db.query(addQuery, queryValues)
    },

    selectExpenseTypeQuery(req) {
        const selectQuery = 'SELECT * FROM budget.expenses_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(selectQuery, queryValues)
    },

    updateExpenseTypeQuery(req) {
        const updateQuery = 'UPDATE budget.expenses_category_assigned_to_user SET name = $1 WHERE id = $2'
        const queryValues = [
            req.body.name,
            req.params.id
        ]
        return db.query(updateQuery, queryValues)
    },

    deleteExpenseTypeQuery(req) {
        const deleteQuery = 'DELETE FROM budget.expenses_category_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(deleteQuery, queryValues)
    }
}

export default Queries