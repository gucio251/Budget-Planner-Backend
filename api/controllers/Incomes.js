import db from './../db/index'

function createDateString(givenString) {
    return givenString.slice(0, 4) + '-' + givenString.slice(4, 6) + '-' + givenString.slice(6, 8)
}

const Income = {
    async add(req, res){
            const { body } = req;
            const {
                amount,
                currency_id,
                category_id,
                transaction_date,
            } = body;
        const addIncome = 'INSERT INTO budget.incomes VALUES (DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING *'

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
              comment,
            ];

            const { rows } = await db.query(addIncome, valuesToInsert)

            return res.status(200).send({
              message: "Income type has been successfully added",
              insertId: rows[0].id,
            });
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async getAll(req, res){
        const selectQuery = 'SELECT * FROM budget.incomes_overview WHERE user_id = $1'

        try{
            const queryValues = [
                req.user.id,
            ]

            const { rows } = await db.query(selectQuery, queryValues)

            const finalRows = rows.map(row=> {
                return Object.assign({}, row, {amount: parseFloat(row.amount)})
            })

            if(!rows[0]){
                return res.status(400).send({message: 'There are no incomes registered'})
            }

            return res.status(200).send({ results: finalRows });
        }catch(err){
            console.log(err)
            return res.status({message: err})
        }
    },

    async getAllSortedByType(req, res){
        const selectQuery = 'SELECT budget.getIncomesGroupedByType($1, $2, $3)'

        try{
            const queryValues = [
                createDateString(req.params.startDate),
                createDateString(req.params.endDate),
                req.user.id
            ]

            const { rows } = await db.query(selectQuery, queryValues)
            const allIncomes = rows.map(expense => expense.getincomesgroupedbytype)
            return res.status(200).send({results: allIncomes})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async update(req, res){
        const selectIncomeTypeId = 'SELECT * FROM budget.incomes_category_assigned_to_user WHERE user_id = $1 AND name = $2'
        const selectBasedIncome = 'SELECT * FROM budget.incomes WHERE id = $1'
        const updateIncomeQuery = 'UPDATE budget.incomes SET income_category_assigned_to_user_id = $1, amount = $2, date = $3, comments = $4 WHERE id = $5'

        try{
            const { rows } = await db.query(selectBasedIncome, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({message: 'Income with given ID does not exist'})
            }

            const oldIncome = rows[0]
            let result

            if(req.body.type){
                result = await db.query(selectIncomeTypeId, [req.user.id, req.body.type])
            }

            let newIncometypeId = result.rows[0].id || oldIncome.id

            const updatedValues = [
                newIncometypeId,
                req.body.amount || oldIncome.amount,
                req.body.date || oldIncome.date,
                req.body.comments || oldIncome.comments,
                parseInt(req.params.id)
            ]

            await db.query(updateIncomeQuery, updatedValues)
            return res.status(200).send({message: 'Income has been successfully updated'})
        }catch(err){
            console.log(err)
            return res.status(400).send({message: err})
        }
    },

    async delete(req, res){
        const selectQuery = 'SELECT * FROM budget.incomes WHERE id = $1'
        const deleteQuery = 'DELETE FROM budget.incomes WHERE id = $1'

        try{
            const {rows} = await db.query(selectQuery, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({message: 'Given income does not exist in database'})
            }

            await db.query(deleteQuery, [req.params.id])
            return res.status(200).send({message: 'Income has been successfully deleted'})
        }catch(err){
            res.status(400).send({message: err})
        }
    }
}

export default Income