import db from '../db'


function createDateString(givenString){
    return givenString.slice(0,4) + '-' + givenString.slice(4,6) + '-' + givenString.slice(6,8)
}

const Expense = {
    async add(req, res){
        const {body} = req;
        const {amount, currency_id, category_id, transaction_date} = body;
        const insertExpense = 'INSERT INTO budget.expenses VALUES (DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING *'

        if(!amount || !currency_id || !category_id || !transaction_date){
            return res.status(400).send({message: 'Request parameter/s is/are missing'})
        }

        try{
            const comment = req.body.comment || ''

            const valuesToInsert = [
                req.user.id,
                category_id,
                currency_id,
                amount,
                transaction_date,
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
        const selectQuery = 'SELECT * FROM budget.expenses_overview WHERE user_id = $1'

        try{

            const { rows } = await db.query(selectQuery, [req.user.id]);

            const finalRows = rows.map(row=> {
                return Object.assign({}, row, {amount: parseFloat(row.amount)})
            })

            if(!rows[0]){
                return res.status(400).send({message: 'There is no expense assigned for user'})
            }

            return res.status(200).send({ result: finalRows });
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