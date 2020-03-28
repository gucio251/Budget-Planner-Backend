import db from '../db/index'

const PaymentMethods = {
    async addPaymentMethod(req, res){
        const addQuery = 'INSERT INTO budget.payment_methods_assigned_to_user VALUES (DEFAULT, $1, $2)'

        if(!req.body.name){
            return res.status(400).send({message: 'Payment method has not been added'})
        }

        try{
            const queryParams = [
                req.user.id,
                req.body.name
            ]

            await db.query(addQuery, queryParams)
            return res.status(200).send({message: `${req.body.name} has been added`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async updatePaymentMethod(req, res){
        const selectQuery = 'SELECT name FROM budget.payment_methods_assigned_to_user WHERE name = $1 and user_id = $2'
        const updateQuery = 'UPDATE budget.payment_methods_assigned_to_user SET name = $1 WHERE name= $2 AND user_id = $3'

        if(!req.body.oldName || ! req.body.newName){
            return res.status(400).send({message: 'There is not old/new payment method in request'})
        }

        try{
            const selectValues = [
                req.body.oldName,
                req.user.id
            ]
            const { rows } = await db.query(selectQuery, selectValues)

            if(!rows[0].name){
                return res.status(400).send({message: `${req.body.oldName} is not registed as payment method`})
            }

            const updateValues = [
                req.body.newName,
                req.body.oldName,
                req.user.id
            ]

            await db.query(updateQuery, updateValues)
            return res.status(200).send({message: `${req.body.oldName} has been updated to ${req.body.newName}`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async deletePaymentMethod(req, res){
        const selectQuery = 'SELECT name FROM budget.payment_methods_assigned_to_user WHERE name = $1 and user_id = $2'
        const deleteQuery = 'DELETE FROM budget.payment_methods_assigned_to_user WHERE name = $1 and user_id = $2'

        if(!req.body.name){
            return res.status(400).send({message:  `There is no name send in request`})
        }

        try{
            const queryValues = [
                req.body.name,
                req.user.id
            ]

            const { rows } = await db.query(selectQuery, queryValues)

            if(!rows[0].name){
                return res.status(400).send({ message: `${req.body.name} is not registered in database`})
            }

            await db.query(deleteQuery, queryValues)
            return res.status(200).send({message: `${req.body.name} has been successfully deleted`})
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async getAllMethods(req, res){
        const selectQuery = 'SELECT name FROM budget.payment_methods_assigned_to_user WHERE user_id = $1'

        try{
            const { rows } = await db.query(selectQuery, [req.user.id])

            const allMethods = rows.map(row => row.name)

            if(!allMethods || !allMethods[0]){
                return res.status(400).send({message: 'There are no payment methods registered for user'})
            }

            return res.status(200).send({result: allMethods})
        }catch(err){
            return res.status(400).send({message: err})
        }
    }
}

export default PaymentMethods