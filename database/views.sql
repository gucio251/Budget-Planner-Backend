--show all expenses with descriptions
CREATE VIEW budget.expenses_overview AS
    SELECT
    expenses.user_id,
    expenses_category_assigned_to_user.name as expense_type,
    payment_methods_assigned_to_user.name as payment_type,
    expenses.amount,
    CAST(expenses.date as DATE) as transaction_date,
    expenses.comments
    FROM budget.expenses
    inner join budget.expenses_category_assigned_to_user on budget.expenses.expense_category_assigned_to_user_id = budget.expenses_category_assigned_to_user.id
    inner join budget.payment_methods_assigned_to_user on budget.expenses.payment_type_assigned_to_user_id = budget.payment_methods_assigned_to_user.id;

--show all incomes with descriptions
    CREATE VIEW budget.incomes_overview as
    SELECT
    incomes.user_id,
    incomes_category_assigned_to_user.name as income_type,
    incomes.amount,
    CAST(incomes.date as DATE) as transaction_date,
    incomes.comments
    FROM budget.incomes
    inner join budget.incomes_category_assigned_to_user on budget.incomes.income_category_assigned_to_user_id = budget.incomes_category_assigned_to_user.id;
