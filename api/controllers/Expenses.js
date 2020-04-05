import db from '../db'

async function getPaymentTypeAndExpenseCategoryIDs(user_id, paymentName, expenseCategory){
    const selectExpenseType = 'SELECT id FROM budget.expenses_category_assigned_to_user WHERE user_id = $1 AND name = $2'
    const selectPaymentType = 'SELECT id FROM budget.payment_methods_assigned_to_user WHERE user_id = $1 AND name = $2'

    try{
        const expenseTypeResult = await db.query(selectExpenseType, [user_id, expenseCategory])
        const paymentTypeResult = await db.query(selectPaymentType, [user_id, paymentName])

        let expenseTypeId, paymentTypeId

        expenseTypeId = !expenseTypeResult.rows[0] ? '' : expenseTypeResult.rows[0]
        paymentTypeId = !paymentTypeResult.rows[0] ? '' : paymentTypeResult.rows[0]

        const result = {
            expenseType: expenseTypeId,
            paymentType: paymentTypeId
        }

        return result
    }catch(err){
        return err
    }

}

function createDateString(givenString){
    return givenString.slice(0,4) + '-' + givenString.slice(4,6) + '-' + givenString.slice(6,8)
}

const Expense = {
    async add(req, res){
        const insertExpense = 'INSERT INTO budget.expenses VALUES (DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING *'

        if(!req.body.type || !req.body.payment_type || !req.body.amount || !req.body.date){
            return res.status(400).send({message: 'Request parameter/s is/are missing'})
        }

        try{
            const {expenseType, paymentType} = await getPaymentTypeAndExpenseCategoryIDs(req.user.id, req.body.payment_type, req.body.type)

            if(!expenseType){
                return res.status(400).send({message: `Expense has not been added. ${req.body.type} is not registered as expense type`})
            }

            if(!paymentType){
                return res.status(400).send({ message: `Expense has not been added. ${req.body.payment_type} is not registered as payment type`})
            }

            const comment = req.body.comment || ''

            const valuesToInsert = [
                req.user.id,
                expenseType.id,
                paymentType.id,
                req.body.amount,
                req.body.date,
                comment
            ]

            const { rows } = await db.query(insertExpense, valuesToInsert)

            return res.status(200).send({
                message: 'Expense has been successfully added',
                insertId: rows[0].id
            })
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async update(req, res){
        const selectOldExpense = 'SELECT * FROM budget.expenses WHERE id = $1'
        const updateExpense = 'UPDATE budget.expenses SET expense_category_assigned_to_user_id = $1, payment_type_assigned_to_user_id = $2, amount = $3, date = $4, comments = $5 WHERE id = $6'

        if(!req.params.id){
            return res.status(400).send({message: 'Missing expense id'})
        }

        try{
            const { rows } = await db.query(selectOldExpense, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({message: 'Expense with given id does not exist in db'})
            }

            const oldExpense = rows[0]

            const updatedType = req.body.newType || ''
            const updatedPayment = req.body.newPayment || ''

            const updatedInfo = await getPaymentTypeAndExpenseCategoryIDs(req.user.id, updatedPayment, updatedType)

            const updatedValues = [
                updatedInfo.expenseType.id || null,
                updatedInfo.paymentType.id || null,
                req.body.newAmount || oldExpense.amount,
                req.body.newDate || oldExpense.date,
                req.body.newComment || oldExpense.comments,
                oldExpense.id
            ]

            const nullAvailability = updatedValues.some((value)=> value == null)

            if(nullAvailability){
                return res.status(400).send({message: 'ExpenseType or/and PaymentType have not been assigned to user'})
            }

            await db.query(updateExpense, updatedValues)
            return res.status(200).send({message: 'Expense has been successfully updated'})

        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async getAll(req, res){
        const selectQuery = 'SELECT * FROM budget.expenses_overview WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3'

        try{
            const queryValues = [
                req.user.id,
                createDateString(req.params.startDate),
                createDateString(req.params.endDate)
            ]

            const { rows } = await db.query(selectQuery, queryValues)

            if(!rows[0]){
                return res.status(400).send({message: 'There is no expense assigned for user'})
            }

            return res.status(200).send({result: rows})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async getAllSortedByType(req, res){
        const startDate = createDateString(req.params.startDate)
        const endDate = createDateString(req.params.endDate)

        const selectQuery = 'SELECT budget.getExpensesGroupedByType($1, $2, $3)'

        const valuesForQuery = [
            startDate,
            endDate,
            req.user.id
        ]

        try{
            const {rows} = await db.query(selectQuery, valuesForQuery)
            const expenses = rows.map(expense => expense.getexpensesgroupedbytype)
            return res.status(200).send({result: expenses})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async delete(req, res){
        const selectQuery = 'SELECT * FROM budget.expenses WHERE id = $1'
        const deleteQuery = 'DELETE FROM budget.expenses WHERE id = $1'

        try{
            const {rows} = await db.query(selectQuery, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({message: 'Given expense does not exist in database'})
            }

            await db.query(deleteQuery, [req.params.id])
            return res.status(200).send({message: 'Expense has been successfully deleted'})
        }catch(err){
            res.status(400).send({message: err})
        }
    }
}

export default Expense