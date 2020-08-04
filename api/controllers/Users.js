import db from '../db/index'
import bcrypt from 'bcrypt'

const Users = {
    async updateUserInfo(req, res) {
        const selectQuery = 'SELECT * FROM budget.users WHERE id = $1'
        const updateQuery = 'UPDATE budget.users SET login = $1, email= $2 WHERE id = $3 RETURNING login, email'

        try {
            const { rows } = await db.query(selectQuery, [req.user.id])

            if(!rows[0]){
                return res.status(400).send({message: 'There is not such user registered in db'})
            }

            const updatedData = [
                 req.body.login || rows[0].login,
                 req.body.email || rows[0].email,
                 req.user.id
            ]

            const response = await db.query(updateQuery, updatedData)

            return res.status(200).json({
                data: response.rows[0],
                message: 'User has been successfully updated'
            })
        } catch(err) {
            return res.status(400).send({message: err})
        }
    },
    async updatePassword(req, res){
        if(!req.body.prevPassword || !req.body.newPassword){
            return res.status(400).send({message: "Old/New password is/are missing"})
        }

        const selectQuery = 'SELECT password FROM budget.users WHERE id = $1'
        const updateQuery = 'UPDATE budget.users SET password = $1 WHERE id = $2'
        try{
            const { rows } = await db.query(selectQuery, [req.user.id])
            const oldHashedPassword = rows[0].password

            if(!bcrypt.compareSync(req.body.prevPassword, oldHashedPassword)){
                return res.status(400).send({message: 'Given old password is incorrect'})
            }

            const newHashedPassword = bcrypt.hashSync(req.body.newPassword, 10)

            const queryValues = [
                newHashedPassword,
                req.user.id
            ]

            await db.query(updateQuery, queryValues)
            return res.status(200). send({message: 'Password has been successfully updated'})
        } catch(err){
            res.status(400).send(err)
        }
    },

    async deleteUser(req, res){
        const selectQuery = 'SELECT id FROM budget.users WHERE id = $1'
        const deleteQuery = 'DELETE FROM budget.users WHERE id = $1'

        try{
            const { rows } = await db.query(selectQuery, [req.user.id])

            const userId = rows[0].id

            if(!userId){
                return res.status(400).send({message: 'User does not exist in database'})
            }

            await db.query(deleteQuery, [req.user.id])
            return res.status(200).send({message: 'Account has been deleted'})
        }catch(err){
            return res.status(400).send(err)
        }
    },

    async getUserInfo(req, res){
       const selectInfoQuery = 'SELECT login, email FROM budget.users WHERE id = $1'
       const selectUserQuery = 'SELECT id FROM budget.users WHERE id = $1'

       try{
           const { rows } = await db.query(selectUserQuery, [req.user.id])

           const userId = rows[0].id

           if(!userId){
                return res.status(400).send({message: 'User does not exist in database'})
           }

            const userData = await db.query(selectInfoQuery, [req.user.id])
            return res.status(200).send({
                login: userData.rows[0].login,
                email: userData.rows[0].email
            })
       }catch(err){
           return res.status(400).send(err)
       }

    },

    async getUsersEmails(req, res){
        const selectQuery = "SELECT * FROM budget.users"

        try{
            const {rows} = await db.query(selectQuery)

            const emails = rows.map(row => row.email);

            return res.status(200).send({
                users: emails
            })
        }catch(err){
            return res.status(400).send(err)
        }
    }
}

export default Users