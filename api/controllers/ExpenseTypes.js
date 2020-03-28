import db from '../db'

const ExpenseTypes = {
    async allExpenseCategories(req, res){
        const queryText = 'SELECT name FROM budget.expenses_category_assigned_to_user WHERE user_id = $1'

        try{
            const { rows, rowCount } = await db.query(queryText, [req.user.id])
            const expenses = rows.map(expense => expense['name'])

            return res.status(200).json({
                allExpenseTypes : expenses,
                rowsAmount: rowCount
            })
        } catch(err){
            return res.status(400).json(err)
        }
    },

    async addExpense(req, res){
        const addExpense ='INSERT INTO budget.expenses_category_assigned_to_user VALUES(DEFAULT, $1, $2)'

        if(!req.body.name){
            return res.status(400).send({message: 'Expense cannot be added. Name is missing'})
        }

        const queryValues = [
            req.user.id,
            req.body.name
        ]

        try{
            await db.query(addExpense, queryValues)
            return res.status(200).json({message: 'Expense has been successfully added'})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async updateExpense(req, res){
        const updateExpense = 'UPDATE budget.expenses_category_assigned_to_user SET name = $1 WHERE name = $2 AND user_id = $3'
        const getExpense = 'SELECT name FROM budget.expenses_category_assigned_to_user WHERE user_id =$1 AND name = $2'

        if(!req.body.newName || ! req.body.oldName){
            return res.status(400).send({message: 'There is not new/old name of Expense'})
        }

        try{
            const selectValues = [
                req.user.id,
                req.body.oldName
            ]

            const { rows } = await db.query(getExpense, selectValues)

            if(!rows[0]){
                return res.status(400).send({message: 'There is no Expense Category to modify'})
            }

            const updateValues = [
                req.body.newName,
                req.body.oldName,
                req.user.id
            ]

            await db.query(updateExpense, updateValues)
            res.status(200).json({message: `${req.body.oldName} has been successfully updated to ${req.body.newName}`})
        }catch(err){
            res.status(400).send({message: err})
        }
    },

    async deleteExpense(req, res){
        const selectQuery = 'SELECT name FROM budget.expenses_category_assigned_to_user WHERE name = $1 AND user_id = $2'
        const deleteQuery = 'DELETE FROM budget.expenses_category_assigned_to_user WHERE name = $1 AND user_id = $2'

        if(!req.body.name){
            return status(400).send({message: 'There is no name of Expense'})
        }

        try{
            const queryValues = [
                req.body.name,
                req.user.id
            ]

            const { rows } = await db.query(selectQuery, queryValues)

            if(!rows[0]){
                return res.status(400).send({message: 'There is no Expense Category to modify'})
            }

            await db.query(deleteQuery, queryValues)
            return res.status(200).send({message: `${req.body.name} has been successfully deleted`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    }
}

export default ExpenseTypes