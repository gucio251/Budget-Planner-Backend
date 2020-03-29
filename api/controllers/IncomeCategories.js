import db from './../db/index'

const IncomeCategories = {
    async getAll(req, res){
        const selectQuery = 'SELECT name FROM budget.incomes_category_assigned_to_user WHERE user_id = $1'

        try{
            const { rows } = await db.query(selectQuery, [req.user.id])

            const incomeCategories = rows.map(row => row.name)

            if(!incomeCategories[0]){
                return res.status(400).send({message: 'There are no income categories registered'})
            }

            return res.status(200).send({result: incomeCategories})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async addOne(req, res){
        const addQuery = 'INSERT INTO budget.incomes_category_assigned_to_user VALUES (DEFAULT, $1, $2) RETURNING *'

        if(!req.body.name){
            return res.status(400).send({message: 'Income category has not been added'})
        }

        try{
            const queryParams = [
                req.user.id,
                req.body.name
            ]

            const { rows } = await db.query(addQuery, queryParams)
            const addedItemId = rows[0].id
            return res.status(200).send({
                message: `${req.body.name} has been successfully added`,
                result: addedItemId
            })
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async update(req, res){
        const selectQuery = 'SELECT * FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const updateQuery = 'UPDATE budget.incomes_category_assigned_to_user SET name = $1 WHERE id = $2'

        if(!req.body.name){
            return res.status(400).send({message: "Missing argument name in request"})
        }

        try{
            const { rows } = await db.query(selectQuery, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({message: `${req.body.name} does not exist in database`})
            }

            await db.query(updateQuery, [req.body.name, req.user.id])
            return res.status(200).send({message: `${rows[0].name} has been successfully updated to ${req.body.name}`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async delete(req, res){
        const selectQuery = 'SELECT * FROM budget.incomes_category_assigned_to_user WHERE id = $1'
        const deleteQuery = 'DELETE FROM budget.incomes_category_assigned_to_user WHERE id = $1'

        try{
            const { rows } = await db.query(selectQuery, [req.params.id])

            if(!rows[0]){
                return res.status(400).send({ message: `Income category is not registered in database`})
            }

            await db.query(deleteQuery, [req.params.id])
            return res.status(200).send({message: `Income category has been successfully deleted`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    }
}

export default IncomeCategories