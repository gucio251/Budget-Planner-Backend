BEGIN;
\i :dir/schema.sql
\i :dir/domains.sql
\i :dir/sequences.sql
\i :dir/tables.sql
\i :dir/procedures.sql
\i :dir/dane/insert_default_expenses.sql
\i :dir/dane/insert_default_incomes.sql
\i :dir/dane/insert_default_payment.sql
\i :dir/dane/insert_users.sql
\i :dir/dane/insert_expenses.sql
\i :dir/dane/insert_incomes.sql
\i :dir/views.sql
COMMIT;