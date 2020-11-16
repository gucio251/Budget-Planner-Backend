--show all expenses with descriptions
    CREATE VIEW budget.expenses_overview as
    SELECT
    expenses.user_id,
    expenses.id as id,
    expenses_category_default.name as category,
    expenses_categories_config_default.id as category_id,
    currencies_assigned_to_user.id as currency_id,
    currencies_default.name as currency,
    expenses_subcategory_default.name as subcategory,
    ROUND(expenses.amount::DECIMAL, 2) as amount,
    CAST(expenses.date as DATE) as transaction_date,
    expenses.comments
    FROM budget.expenses
    inner join budget.currencies_assigned_to_user on budget.expenses.currency_id = budget.currencies_assigned_to_user.id
    inner join budget.currencies_default on budget.currencies_assigned_to_user.currency_id = budget.currencies_default.id
    inner join budget.expenses_category_assigned_to_user on budget.expenses.expense_category_assigned_to_user_id = budget.expenses_category_assigned_to_user.id
    inner join budget.expenses_categories_config_default on budget.expenses_categories_config_default.id = budget.expenses_category_assigned_to_user.connected_cat_id
    inner join budget.expenses_category_default on budget.expenses_category_default.id = budget.expenses_categories_config_default.category_id
    inner join budget.expenses_subcategory_default on budget.expenses_subcategory_default.id = budget.expenses_categories_config_default.subcategory_id;

--show all incomes with descriptions
    CREATE VIEW budget.incomes_overview as
    SELECT
    incomes.user_id,
    incomes.id as id,
    incomes_category_default.name as category,
    incomes_categories_config_default.id as category_id,
    currencies_assigned_to_user.id as currency_id,
    currencies_default.name as currency,
    incomes_subcategory_default.name as subcategory,
    ROUND(incomes.amount::DECIMAL, 2) as amount,
    CAST(incomes.date as DATE) as transaction_date,
    incomes.comments
    FROM budget.incomes
    inner join budget.currencies_assigned_to_user on budget.incomes.currency_id = budget.currencies_assigned_to_user.id
    inner join budget.currencies_default on budget.currencies_assigned_to_user.currency_id = budget.currencies_default.id
    inner join budget.incomes_category_assigned_to_user on budget.incomes.income_category_assigned_to_user_id = budget.incomes_category_assigned_to_user.id
    inner join budget.incomes_categories_config_default on budget.incomes_categories_config_default.id = budget.incomes_category_assigned_to_user.connected_cat_id
    inner join budget.incomes_category_default on budget.incomes_category_default.id = budget.incomes_categories_config_default.category_id
    inner join budget.incomes_subcategory_default on budget.incomes_subcategory_default.id = budget.incomes_categories_config_default.subcategory_id
