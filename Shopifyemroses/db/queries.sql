/* CREATE TABLES */
/*--------------------------------------*/
/* Creates CheckoutID Table */
create table checkout_ids (
    id INTEGER PRIMARY KEY ASC,
    checkout_id INTEGER
);

/* Creates OrderPages Table */
create table order_pages (
    id INTEGER PRIMARY KEY ASC,
    order_id INTEGER,
    checkout_id INTEGER,
    contact_email TEXT,
    line_items JSON,
    uuid TEXT,
    link TEXT /* /massgift/ordercompletions/<uuid> */
);

/* Creates ShipStatuses Table */
create table ship_statuses (
    id INTEGER PRIMARY KEY ASC,
    order_id INTEGER,
    fulfilled BOOLEAN,
    field_entry TEXT,
    is_field_phone BOOLEAN,
    is_field_email BOOLEAN,
    uuid TEXT,
    link TEXT /* /massgift/ship-entries/<uuid> */
);
/*--------------------------------------*/


/* Adding new columns.. */
alter table testtable
    add column json_test json;

insert into testtable (name) values ('fag');

select * from testtable;
