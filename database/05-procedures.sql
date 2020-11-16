--for each new user add default payment methods, default incomes, default expenses
CREATE OR REPLACE FUNCTION budget.insertDefaultPaymentMethodsForUser() RETURNS TRIGGER AS $$
    DECLARE
        currencyId INT :=0;
        incomeMethodId INT :=0;
        expenseMethodId INT :=0;
    BEGIN
        FOR incomeMethodId IN
            SELECT id FROM budget.incomes_categories_config_default
        LOOP
            INSERT INTO budget.incomes_category_assigned_to_user VALUES (DEFAULT, NEW.id, incomeMethodId);
        END LOOP;

        FOR expenseMethodId IN
            SELECT id FROM budget.expenses_categories_config_default
        LOOP
            INSERT INTO budget.expenses_category_assigned_to_user VALUES (DEFAULT, NEW.id, expenseMethodId);
        END LOOP;

        For currencyId IN
            Select id FROM budget.currencies_default
        LOOP
            INSERT INTO budget.currencies_assigned_to_user VALUES (DEFAULT, NEW.id, currencyId);
        END LOOP;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_insertDefaultPaymentsMethodsForUser
AFTER INSERT ON budget.users
FOR EACH ROW EXECUTE PROCEDURE budget.insertDefaultPaymentMethodsForUser();