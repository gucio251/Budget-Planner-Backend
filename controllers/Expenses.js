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
            const comments = req.body.comments || ''

            const valuesToInsert = [
                req.user.id,
                category_id,
                currency_id,
                amount,
                transaction_date,
                comments
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
        const { body } = req;
        const {
          amount,
          currency_id,
          category_id,
          transaction_date,
          comments,
        } = body;
        const updateExpenseQuery =
          "UPDATE budget.expenses SET expense_category_assigned_to_user_id = $1, amount = $2, date = $3, currency_id = $4, comments = $5 WHERE id = $6";

        try {
          const updatedValues = [
            category_id,
            amount,
            transaction_date,
            currency_id,
            comments,
            parseInt(req.params.id),
          ];

          await db.query(updateExpenseQuery, updatedValues);
          return res
            .status(200)
            .send({ message: "Expense has been successfully updated" });
        } catch (err) {
          return res.status(400).send({ message: err });
        }
    },

    async getAll(req, res){
        const selectQuery = `
            SELECT
                json_object_agg(
                    id, json_build_object(
                        'expenseType_id', expense_category_assigned_to_user_id,
                        'currency_id', currency_id,
                        'amount', amount,
                        'date', date,
                        'comment', comments,
                        'type', 'expense'
                    )
                ) as expenses
            FROM budget.expenses where user_id=$1
        `

        try{

            const { rows } = await db.query(selectQuery, [req.user.id]);

            return res.status(200).send({ result: rows });
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
            return res.status(200).send({message: 'Expense has been successfully deleted', id: req.params.id})
        }catch(err){
            res.status(400).send({message: err})
        }
    }
}

export default Expense