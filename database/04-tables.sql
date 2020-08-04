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

CREATE TABLE budget.incomes_category_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_category_user_seq'),
    user_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users (id) ON DELETE CASCADE
);

CREATE TABLE budget.incomes
(
    id INTEGER NOT NULL DEFAULT nextval('budget.income_id_seq'),
    user_id INTEGER NOT NULL,
    income_category_assigned_to_user_id INTEGER NOT NULL,
    amount budget.amount,
    date TIMESTAMP NOT NULL,
    comments VARCHAR,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_assigned_to_user_id) REFERENCES budget.incomes_category_assigned_to_user(id) ON DELETE CASCADE
);

CREATE TABLE budget.expenses_category_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_category_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.expenses_category_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_category_user_seq'),
    user_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users (id) ON DELETE CASCADE
);

CREATE TABLE budget.payment_methods_default
(
    id INTEGER NOT NULL DEFAULT nextval('budget.payment_methods_default_seq'),
    name VARCHAR NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE budget.payment_methods_assigned_to_user
(
    id INTEGER NOT NULL DEFAULT nextval('budget.payment_methods_user_seq'),
    user_id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE
);

CREATE TABLE budget.expenses
(
    id INTEGER NOT NULL DEFAULT nextval('budget.expense_id_seq'),
    user_id INTEGER NOT NULL,
    expense_category_assigned_to_user_id INTEGER NOT NULL,
    payment_type_assigned_to_user_id INTEGER NOT NULL,
    amount budget.amount,
    date TIMESTAMP NOT NULL,
    comments VARCHAR,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES budget.users(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_assigned_to_user_id) REFERENCES budget.expenses_category_assigned_to_user(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_type_assigned_to_user_id) REFERENCES budget.payment_methods_assigned_to_user(id) ON DELETE CASCADE
);



