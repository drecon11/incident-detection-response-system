-- Thurday 3-26-2026
-- this is a select statement
SELECT *
from product

-- display a list of the product codes, description, price and the vendor code
select p_code, p_descript, p_price, v_code
from product

-- display a  list of the vendors in the database
select *
from vendor

-- display alist of the customer last name, first name, and balance
select cus_lname, cus_fname, cus_balance
from customer

-- for more meaningful header
select cus_lname as Customer_LastName, cus_fname as Customer_FirstName, cus_balance as Customer_Balance
from customer

-- single '' or double "" quotes substitute the underscore(_)
select cus_lname as Customer_LastName, cus_fname as 'Customer_First_Name', cus_balance as Customer_Balance
from customer

-- display a list of vendors in TN
select *
from vendor
where v_state = 'TN'

-- display a list of customers who have outstanding balance
select *
from customer
where cus_balance > 0

-- you can use compound condition in the where part
-- display a list of customers with outstanding balance in area code 713
select *
from customer
where cus_balance > 0 AND cus_areacode = '713'

--display a list of the products supplied by vendors 21344 and 24288 (may have to refine the condition)
select *
from product
where v_code = 21344 or v_code = 24288

-- display a list of all the products and the value of the current inventory
select p_code, p_descript, p_qoh, p_price, (p_qoh * p_price) as 'Value'
from product

-- Tuesday 3-31-2026
-- list all the products supplied by the vendor 21344 with a price mmre than $10
select *
from product
where v_code = 21344 and p_price > 10;

-- list the products with price more than $5 and supplied by vendor 21344, 24288
select *
from product
where p_price > 5 and (v_code = 21344 or v_code = 24288);

-- list the products with price more than $100 and supplied by vendor 21344, 24288 (using parenthesis is crucial)
select *
from product
where (p_price > 100) and (v_code = 21344 or v_code = 24288);

-- display all the product with price between $15 and $100 (always use parenthesis to be safe)
select *
from product
where (p_price > 15) and (p_price < 100);

-- display all the product with price between $15 and $99.87
select *
from product
where (p_price > 15) and (p_price < 99.87);

-- display all the product with price between $15 and $100 ('between' is inclusive like <= or >=)
select *
from product
where p_price between 15 and 99.87;

-- display a list of the product made in house (not supplied by any vendor) (never '=' null, you must use 'is' null, null is not a value)
select *
from product
where v_code is null ;

-- display a list of the product supplied by vendors (use 'is  not' null to display everything but null)
select *
from product
where v_code is  not null ;

-- list all the vendors with a contact name smith
select *
from vendor
where v_contact = 'smith'

-- list all the vendors with a contact name that starts with smith (wildcard (%) 
-- smith_______ -> 'smith'% (means starts with smith)
-- ____smith____-> '%smith% (means contains smith)
-- _____smith -> '%smith	(means ends with smith)
select *
from vendor
where v_contact like 'smith%';
where v_contact like '%smith%';
where v_contact like '%smith';

-- Thursday 4-2-2026
-- display a list of all the products supplied by vendors 21344, 24288, 23119, 25595
select *
from product
where v_code = 21344 or v_code = 24288 or v_code = 23119 or v_code = 25595

-- display a list of all the products supplied by vendors 21344, 24288, 23119, 25595 (using 'in' is the much more efficient way)
select *
from product
where v_code in (21344, 24288, 23119, 25595)

-- display a list of all the products supplied by vendors other than 21344, 24288, 23119, 25595
select *
from product
where v_code not in (21344, 24288, 23119, 25595)

-- display a list of the vendor code for vendors who supply products ( must use is not null because the table has null )
select v_code, p_code
from product
where v_code is not null

-- display a list of the vendor code for vendors who supply products ('distinct' removes duplicates, works with the entire list so you have to be careful )
select distinct v_code, p_code
from product
where v_code is not null

-- list the products not supplied by vendors
select *
from product
where v_code is null

