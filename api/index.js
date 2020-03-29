import express from 'express'
import 'babel-polyfill'
import dotenv from 'dotenv'
import {signin, signup, protect} from './middleware/auth'
import Users from './controllers/Users'
import ExpenseTypes from './controllers/ExpenseTypes'
import PaymentMethods from './controllers/PaymentMethods'
import Expense from './controllers/Expense'

dotenv.config();

const app = express()
app.use(express.json())
app.use(require('cors')())
app.set('port', process.env.PORT || 3000)
app.set('host', process.env.HOST || 'localhost')


const router = express.Router()

app.use('/api', router)

router.get('/api', (req, res) => {
    res.status(200).json({ message: 'dasd' })
})


router.post('/signin', signin)
router.post('/signup', signup)
router.put('/users/me', protect, Users.updateUserInfo)
router.delete('/users/me', protect, Users.deleteUser)
router.get('/users/me', protect, Users.getUserInfo)
router.put('/users/me/password', protect, Users.updatePassword)

router.get('/expenseCategories', protect, ExpenseTypes.allExpenseCategories)
router.post('/expenseCategories', protect, ExpenseTypes.addExpense)
router.put('/expenseCategories', protect, ExpenseTypes.updateExpense)
router.delete('/expenseCategories', protect, ExpenseTypes.deleteExpense)

router.get('/paymentMethods/all', protect, PaymentMethods.getAllMethods)
router.post('/paymentMethods', protect, PaymentMethods.addPaymentMethod)
router.put('/paymentMethods', protect, PaymentMethods.updatePaymentMethod)
router.delete('/paymentMethods', protect, PaymentMethods.deletePaymentMethod)

router.post('/expenses', protect, Expense.add)
router.put('/expenses/:id', protect, Expense.update)
router.get('/expenses/:startDate/:endDate', protect, Expense.getAll)
router.get('/expenses/sorted/:startDate/:endDate', protect, Expense.getAllSortedByType)
router.delete('/expenses/:id', protect, Expense.delete)

app.listen(app.get('port'), () => {
    console.log('Express started on http://' + app.get('host') + ':' + app.get('port') + '/api; press Ctrl-C to terminate.')
})

export default app