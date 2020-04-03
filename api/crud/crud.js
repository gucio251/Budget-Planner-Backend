import db from "../db"

const CRUD = {
    async addOne(req, res, config) {
        if(!req.body.name){
            return res.status(400).send({message: `${config.name} cannot be added. Name is missing`})
        }

        try{
            const {rows} = await config.dbQuery(req)

            return res.status(200).json({
                message: `${config.name} has been successfully added`,
                result: rows[0].id
        })
        }catch(err){
            return res.status(400).send({message: err})
        }
    },

    async deleteOne(req, res, config){
        try{
            const { rows } = await config.selectQuery(req)

            if(!rows[0]){
                return res.status(400).send({ message: `${config.name} has not been found in Database` })
            }

            await config.deleteQuery(req)
            return res.status(200).send({ message: `${config.name} has been successfully deleted` })
        }catch(err){
            return res.status(400).send({ message: err })
        }
    },

    async getAll(req, res, config){
        try{
            const { rows } = await config.selectAll(req)

            const allItems = rows.map(row => row[config.property])

            if(!allItems || !allItems[0]){
                return res.status(400).send({ message: `There are no ${config.name} registered for user` })
            }

            return res.status(200).send({ result: allItems })
        }catch(err){
            return res.status(400).send({ message: err })
        }
    },

    async update(req, res, config){
        if (!req.body.name) {
            return res.status(400).send({ message: 'Request does not contain new value' })
        }

        try{
            const { rows } = await config.selectQuery(req)

            if (!rows[0]) {
                return res.status(400).send({ message: `${config.name} with given id does not exist` })
            }

            await config.updateQuery(req)
            return res.status(200).send({ message: `${config.name} has been successfully updated` })
        }catch(err){
            return res.status(400).send({ message: err })
        }
    }
}

export default CRUD