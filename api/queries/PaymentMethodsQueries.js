import db from './../db/index'

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

    selectAllPaymentsQuery(req){
        const selectAll = 'SELECT name FROM budget.payment_methods_assigned_to_user WHERE user_id = $1'
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

