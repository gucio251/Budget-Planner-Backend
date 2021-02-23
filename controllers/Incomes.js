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
              transaction_type_id,
              date,
              comments,
            } = body;
        const addIncome = 'INSERT INTO budget.incomes VALUES (DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING *'

        if(!amount || !currency_id || !transaction_type_id || !date){
            return res.status(400).send({message: 'Request parameter/s is/are missing'})
        }

        try{
            const valuesToInsert = [
              req.user.id,
              transaction_type_id,
              currency_id,
              amount,
              date,
              comments,
            ];

            const { rows } = await db.query(addIncome, valuesToInsert)

            return res.status(200).send({
              message: "Income type has been successfully added",
              id: rows[0].id,
            });
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async getAll(req, res){
        const selectQuery = `
            SELECT
                json_object_agg(
                    id, json_build_object(
                        'id', id,
                        'transaction_type_id', transaction_type_id,
                        'currency_id', currency_id,
                        'amount', amount,
                        'date', date,
                        'comment', comments,
                        'type', 'income'
                    )
                ) as incomes
            FROM budget.incomes where user_id=$1
        `;

        try{
            const queryValues = [
                req.user.id,
            ]

            const { rows } = await db.query(selectQuery, queryValues)

            return res.status(200).send({ results: rows });
        }catch(err){
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
        const { body } = req;
        const {
          amount,
          currency_id,
          transaction_type_id,
          date,
          comments,
        } = body;
        const updateIncomeQuery = 'UPDATE budget.incomes SET transaction_type_id = $1, amount = $2, date = $3, currency_id = $4, comments = $5 WHERE id = $6'

        try{
            const updatedValues = [
              transaction_type_id,
              amount,
              date,
              currency_id,
              comments,
              parseInt(req.params.id),
            ];

            await db.query(updateIncomeQuery, updatedValues)
            return res.status(200).send({message: 'Income has been successfully updated'})
        }catch(err){
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
            return res.status(200).send({message: 'Income has been successfully deleted', id: req.params.id})
        }catch(err){
            res.status(400).send({message: err})
        }
    }
}

export default Income