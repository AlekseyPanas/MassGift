/* RUN THESE QUERIES FOR A NEW DATABASE */
/*--------------------------------------*/

CREATE TABLE "stores" (
	"storeID"	INTEGER,
	"API_key"	TEXT,
	"shop_name"	TEXT,
	PRIMARY KEY("storeID")
);

/*--------------------------------------*/


/* Adding new columns.. */
alter table testtable
    add column json_test json;

insert into testtable (name) values ('fag');

select * from testtable;
