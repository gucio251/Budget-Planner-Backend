--procedures which will check if data is correctly added

--check if date is after 01.01.2000
CREATE FUNCTION budget.checkIfYearIsHigherThan2000() RETURNS TRIGGER AS $$
    DECLARE
        yearChoosenByUser INT := 0;
    BEGIN
        yearChoosenByUser := EXTRACT(YEAR FROM NEW.date);
        IF (yearChoosenByUser < 2000) THEN
            RAISE EXCEPTION 'Podano rok wcześniejszy od 2000, Podany rok: %.', yearChoosenByUser USING
            DETAIL = 'Podano niepoprawną datę.',
            HINT = 'Rok nie może być wcześniejszy niż 2000.';
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_checkIfYearIsHigherThan2000
    AFTER INSERT ON budget.incomes
    FOR EACH ROW EXECUTE PROCEDURE budget.checkIfYearIsHigherThan2000();

CREATE TRIGGER _02_checkIfYearIsHigherThan2000
    AFTER INSERT ON budget.expenses
    FOR EACH ROW EXECUTE PROCEDURE budget.checkIfYearIsHigherThan2000();

--for each new user add default payment methods, default incomes, default expenses
CREATE OR REPLACE FUNCTION budget.insertDefaultPaymentMethodsForUser() RETURNS TRIGGER AS $$
    DECLARE
        paymentMethod VARCHAR :='';
        incomeMethod VARCHAR :='';
        expenseMethod VARCHAR :='';
    BEGIN
        FOR paymentMethod IN
            SELECT name FROM budget.payment_methods_default
        LOOP
            INSERT INTO budget.payment_methods_assigned_to_user VALUES (DEFAULT, NEW.id, paymentMethod);
        END LOOP;

        FOR incomeMethod IN
            SELECT name FROM budget.incomes_category_default
        LOOP
            INSERT INTO budget.incomes_category_assigned_to_user VALUES (DEFAULT, NEW.id, incomeMethod);
        END LOOP;

        FOR expenseMethod IN
            SELECT name FROM budget.expenses_category_default
        LOOP
            INSERT INTO budget.expenses_category_assigned_to_user VALUES (DEFAULT, NEW.id, expenseMethod);
        END LOOP;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

-- for each user check if expenseTypes are not duplicated
CREATE TRIGGER _01_insertDefaultPaymentsMethodsForUser
    AFTER INSERT ON budget.users
    FOR EACH ROW EXECUTE PROCEDURE budget.insertDefaultPaymentMethodsForUser();

CREATE OR REPLACE FUNCTION budget.checkIfExpenseTypeIsUniqueForUser() RETURNS TRIGGER AS $$
    DECLARE
        expenseType VARCHAR := '';
    BEGIN
        FOR expenseType IN
            SELECT name FROM budget.expenses_category_assigned_to_user WHERE user_id = NEW.user_id
        LOOP
            IF(NEW.name = expenseType) THEN
                RAISE EXCEPTION '% expense type already exist', expenseType USING
                DETAIL = 'Duplicated value for user',
                HINT = 'Expense type cannot be duplicated';
                RETURN NULL;
            END IF;
        END LOOP;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_checkIfExpenseIsUniqueForUser
    BEFORE INSERT ON budget.expenses_category_assigned_to_user
    FOR EACH ROW EXECUTE PROCEDURE budget.checkIfExpenseTypeIsUniqueForUser();

--check if payments method for user are not duplicated
CREATE OR REPLACE FUNCTION budget.checkIfPaymentMethodIsUniqueForUser() RETURNS TRIGGER AS $$
    DECLARE
        paymentMethod VARCHAR := '';
    BEGIN
        FOR paymentMethod IN
            SELECT name FROM budget.payment_methods_assigned_to_user WHERE user_id = NEW.user_id
        LOOP
            IF(paymentMethod = NEW.name) THEN
                RAISE EXCEPTION '% already registered as payment method', paymentMethod USING
                DETAIL = 'Duplicated value',
                HINT = 'Payment method cannot be duplicated';
                RETURN NULL;
            END IF;
        END LOOP;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_checkIfPaymentMethodIsUniqueForUser
    BEFORE INSERT ON budget.payment_methods_assigned_to_user
    FOR EACH ROW EXECUTE PROCEDURE budget.checkIfPaymentMethodIsUniqueForUser();

--check if incomeCategory is unique within user
CREATE OR REPLACE FUNCTION budget.checkIfIncomesCategoryIsUniqueForUser() RETURNS TRIGGER AS $$
    DECLARE
        incomeCategory VARCHAR :='';
    BEGIN
        FOR incomeCategory IN
            SELECT name FROM budget.incomes_category_assigned_to_user WHERE user_id = NEW.user_id
        LOOP
            IF(incomeCategory = NEW.name) THEN
                RAISE EXCEPTION '% is already registered as income category', incomeCategory USING
                DETAIL = 'Duplicated value',
                HINT = 'Income category cannot be duplicated';
                RETURN NULL;
            END IF;
        END LOOP;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_checkIfIncomesCategoryIsUnique
    BEFORE INSERT ON budget.incomes_category_assigned_to_user
    FOR EACH ROW EXECUTE PROCEDURE budget.checkIfIncomesCategoryIsUniqueForUser();

--function to get total Incomes for given time period
CREATE FUNCTION budget.getTotalIncomesForGivenTimePeriod (startDate DATE, endDate DATE, loggedUser_id INTEGER) RETURNS DECIMAL AS $$
    DECLARE
        totalValue DECIMAL := 0;
        temp DATE;
    BEGIN
        IF(startDate > endDate) THEN
            temp = startDate;
            startDate = endDate;
            endDate = temp;
        END IF;

        SELECT INTO totalValue sum(amount)
        FROM budget.incomes_overview
        WHERE transaction_date BETWEEN startDate AND endDate AND user_id = loggedUser_id;
        RETURN totalValue;
    END;
$$ LANGUAGE plpgsql;

--function to get total Expenses for given time period
CREATE FUNCTION budget.getTotalExpensesForGivenTimePeriod (startDate DATE, endDate DATE, loggedUser_id INTEGER) RETURNS DECIMAL AS $$
    DECLARE
        totalValue DECIMAL := 0;
        temp DATE;
    BEGIN
        IF(startDate > endDate) THEN
            temp = startDate;
            startDate = endDate;
            endDate = temp;
        END IF;

        SELECT INTO totalValue SUM(amount)
        FROM budget.expenses_overview
        WHERE transaction_date BETWEEN startDate AND endDate AND user_id = loggedUser_id;
        RETURN totalValue;
    END;
$$ LANGUAGE plpgsql;

--get total account status
CREATE FUNCTION budget.getTotalFoundsInBudget(loggedUser_id INTEGER) RETURNS DECIMAL AS $$
    DECLARE
        totalFounds DECIMAL := 0;
        totalIncomes DECIMAL :=0;
        totalExpenses DECIMAL :=0;
    BEGIN
        SELECT INTO totalExpenses SUM(amount) FROM budget.expenses_overview WHERE user_id = loggedUser_id;
        SELECT INTO totalIncomes SUM(amount) FROM budget.incomes_overview WHERE user_id = loggedUser_id;
        totalFounds = totalIncomes - totalExpenses;
        RETURN totalFounds;
    END;
$$ LANGUAGE plpgsql;

-- function to return expenses grouped by type for logged user
CREATE OR REPLACE FUNCTION budget.getExpensesGroupedByType(startDate DATE, endDate DATE, loggedUser_id INTEGER) RETURNS TABLE (result JSON) AS $$
    DECLARE
        temp DATE;
    BEGIN
        IF(startDate > endDate) THEN
            temp = startDate;
            startDate = endDate;
            endDate = temp;
        END IF;

        RETURN QUERY SELECT row_to_json(expenses) FROM
        (
            SELECT expense_type, sum(amount)
            FROM budget.expenses_overview
            WHERE transaction_date BETWEEN startDate AND EndDate AND user_id = loggedUser_id
            GROUP BY expense_type
        ) expenses;
    END;
$$ LANGUAGE plpgsql;

--function to return incomes grouped by type for logged user
CREATE OR REPLACE FUNCTION budget.getIncomesGroupedByType(startDate DATE, endDate DATE, loggedUser_id INTEGER) RETURNS TABLE (result JSON) AS $$
    DECLARE
        temp DATE;
    BEGIN
        IF(startDate > endDate) THEN
            temp = startDate;
            startDate = endDate;
            endDate = temp;
        END IF;

        RETURN QUERY SELECT row_to_json(incomes) FROM(
            SELECT income_type, sum(amount)
            FROM budget.incomes_overview
            WHERE transaction_date BETWEEN startDate AND EndDate AND user_id = loggedUser_id
            GROUP BY income_type
        ) incomes;
    END;
$$ LANGUAGE plpgsql;