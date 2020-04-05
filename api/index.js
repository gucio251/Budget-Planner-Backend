import express from 'express'
import 'babel-polyfill'
import dotenv from 'dotenv'
import {signin, signup, protect} from './middleware/auth'
import Users from './controllers/Users'
import ExpenseTypes from './controllers/ExpenseTypes'
import IncomeTypes from './controllers/IncomeTypes'
import PaymentMethods from './controllers/PaymentMethods'
import Expense from './controllers/Expenses'
import Income from './controllers/Incomes'

dotenv.config();

const app = express()
app.use(express.json())
app.use(require('cors')())
app.set('port', process.env.PORT || 3000)
app.set('host', process.env.HOST || 'localhost')


const router = express.Router()

app.use('/api', router)

router.get('/api', (req, res) => {
    res.status(200).json({ message: 'Welcome to budget planner api' })
})


router.post('/signin', signin)
router.post('/signup', signup)
router.put('/users/me', protect, Users.updateUserInfo)
router.delete('/users/me', protect, Users.deleteUser)
router.get('/users/me', protect, Users.getUserInfo)
router.put('/users/me/password', protect, Users.updatePassword)

router.get('/expenseTypes', protect, ExpenseTypes.getAll)
router.post('/expenseTypes', protect, ExpenseTypes.add)
router.put('/expenseTypes/:id', protect, ExpenseTypes.update)
router.delete('/expenseTypes/:id', protect, ExpenseTypes.delete)

router.get('/paymentMethods/all', protect, PaymentMethods.getAll)
router.post('/paymentMethods', protect, PaymentMethods.add)
router.put('/paymentMethods/:id', protect, PaymentMethods.update)
router.delete('/paymentMethods/:id', protect, PaymentMethods.delete)

router.get('/incomeTypes', protect, IncomeTypes.getAll)
router.post('/incomeTypes', protect, IncomeTypes.add)
router.put('/incomeTypes/:id', protect, IncomeTypes.update)
router.delete('/incomeTypes/:id', protect, IncomeTypes.delete)

router.post('/expenses', protect, Expense.add)
router.put('/expenses/:id', protect, Expense.update)
router.get('/expenses/:startDate/:endDate', protect, Expense.getAll)
router.get('/expenses/sorted/:startDate/:endDate', protect, Expense.getAllSortedByType)
router.delete('/expenses/:id', protect, Expense.delete)

router.post('/incomes', protect, Income.add)
router.get('/incomes/:startDate/:endDate', protect, Income.getAll)
router.get('/incomes/sorted/:startDate/:endDate', protect, Income.getAllSortedByType)
router.put('/incomes/:id', protect, Income.update)
router.delete('/incomes/:id', protect, Income.delete)

app.listen(app.get('port'), () => {
    console.log('Express started on http://' + app.get('host') + ':' + app.get('port') + '/api; press Ctrl-C to terminate.')
})

export default app