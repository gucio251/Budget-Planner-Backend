import db from '../db/index'

const Queries = {
    addPaymentQuery(req) {
        const addQuery = 'INSERT INTO budget.payment_methods_assigned_to_user VALUES (DEFAULT, $1, $2) RETURNING *'
        const queryValues = [
            req.user.id,
            req.body.name
        ]
        return db.query(addQuery, queryValues)
    },

    selectPaymentQuery(req){
        const selectQuery = 'SELECT * FROM budget.payment_methods_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(selectQuery, queryValues)
    },

    deletePaymentQuery(req) {
        const deleteQuery = 'DELETE FROM budget.payment_methods_assigned_to_user WHERE id = $1'
        const queryValues = [req.params.id]
        return db.query(deleteQuery, queryValues)
    },

    selectAllCurrencies(req){
        const selectAll = `
            SELECT
            currencies_assigned_to_user.id as id,
            currencies_default.name
            FROM
            budget.currencies_assigned_to_user
            INNER JOIN budget.currencies_default ON budget.currencies_assigned_to_user.currency_id = budget.currencies_default.id
            WHERE currencies_assigned_to_user.user_id = $1`;
        const queryValues = [req.user.id]
        return db.query(selectAll, queryValues)
    },

    updatePaymentQuery(req){
        const updateQuery = 'UPDATE budget.payment_methods_assigned_to_user SET name = $1 WHERE id = $2'
        const queryValues = [
            req.body.name,
            req.params.id
        ]
        return db.query(updateQuery, queryValues)
    }
}

export default Queries

