import db from './../db/index'

const Queries = {
    selectAllExpensesTypesQuery(req) {
        const selectAll = `
            SELECT
                json_build_object('id', config_default.category_id, 'name', category_default.name, 'subcategories', array_agg(assigned_to_user.id)) as categories,
                json_object_agg(assigned_to_user.id, json_build_object('id', assigned_to_user.id, 'name', subcategory_default.name,'category_id', config_default.category_id)) as subcategories
            FROM budget.expenses_category_assigned_to_user assigned_to_user
                LEFT OUTER JOIN budget.expenses_categories_config_default config_default on assigned_to_user.connected_cat_id = config_default.id
                LEFT OUTER JOIN budget.expenses_subcategory_default subcategory_default on config_default.subcategory_id = subcategory_default.is
                LEFT OUTER JOIN budget.expenses_category_default category_default on config_default.category_id = category_default.id
            WHERE assigned_to_user.user_id=$1
            GROUP BY category_default.name, config_default.category_id
        `;
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