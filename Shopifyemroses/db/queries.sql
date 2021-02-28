/* RUN THESE QUERIES FOR A NEW DATABASE */
/*--------------------------------------*/

/*--------------------------------------*/


/* Adding new columns.. */
alter table testtable
    add column json_test json;

insert into testtable (name) values ('fag');

select * from testtable;
