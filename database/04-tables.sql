CREATE TABLE budget.users
(
    id INTEGER NOT NULL DEFAULT nextval('budget.user_id_seq'),
    email budget.email NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE budget.incomes_category_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_category_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.incomes_subcategory_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_subcategory_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.incomes_categories_config_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_categories_config_default_seq'),
    category_id INTEGER NOT NULL,
    subcategory_id INTEGER NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (category_id) REFERENCES budget.incomes_category_default (id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES budget.incomes_subcategory_default (id) ON DELETE CASCADE
);

CREATE TABLE budget.incomes_category_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_category_user_seq'),
    user_id INTEGER NOT NULL,
    connected_cat_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users (id) ON DELETE CASCADE,
    FOREIGN KEY (connected_cat_id) REFERENCES budget.incomes_categories_config_default (id) ON DELETE CASCADE
);

CREATE TABLE budget.expenses_category_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_category_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.expenses_subcategory_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_subcategory_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.expenses_categories_config_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_categories_config_default_seq'),
    category_id INTEGER NOT NULL,
    subcategory_id INTEGER NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (category_id) REFERENCES budget.expenses_category_default (id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES budget.expenses_subcategory_default (id) ON DELETE CASCADE
);

CREATE TABLE budget.expenses_category_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_category_user_seq'),
    user_id INTEGER NOT NULL,
    connected_cat_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users (id) ON DELETE CASCADE,
    FOREIGN KEY (connected_cat_id) REFERENCES budget.expenses_categories_config_default (id) ON DELETE CASCADE
);

CREATE TABLE budget.currencies_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.currency_id_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.currencies_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.currency_user_id'),
    user_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES budget.currencies_default(id) on DELETE CASCADE
);

CREATE TABLE budget.expenses
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_id_seq'),
    user_id INTEGER NOT NULL,
    expense_category_assigned_to_user_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    amount numeric(9, 2) NOT NULL,
    date DATE NOT NULL,
    comments VARCHAR,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES budget.currencies_assigned_to_user(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_assigned_to_user_id) REFERENCES budget.expenses_category_assigned_to_user(id) ON DELETE CASCADE
);

CREATE TABLE budget.incomes
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_id_seq'),
    user_id INTEGER NOT NULL,
    income_category_assigned_to_user_id INTEGER NOT NULL,
    currency_id INTEGER NOT NULL,
    amount numeric(9, 2) NOT NULL,
    date DATE NOT NULL,
    comments VARCHAR,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_assigned_to_user_id) REFERENCES budget.incomes_category_assigned_to_user(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES budget.currencies_assigned_to_user(id) ON DELETE CASCADE
);




