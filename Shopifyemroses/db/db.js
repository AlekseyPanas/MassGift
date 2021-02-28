var sqlite3 = require('sqlite-async');

// Use this function when calling any queries that write to database. query param is a string with the query
const write_query = async (db, query, params=[]) => {
    // Use '?' in query where parameters would go

    // Creates while loop control variable
    let valid = false;
    // Attempts to run query repeatedly until it works
    while (!valid) {
        // Sets initially to true (innocent until proven guilty)
        valid = true;
        // inserts into database and catches error (specifically the BUSY error)
        let response = await db.run(query, params).catch(err => {valid = false; /* Sets valid to false on error */ });
    };

    // Sends back db response (error if failed)
    return response;
}

// Use this function to test database functionality using the test table (Remove on app release)
const get_test = async () => {
    // Opens connection
    var db = await sqlite3.open('./db/test.db');

    // inserts into db
    await write_query(db, "insert into testtable (name) values (?)", ["PARAMETER TEST BOIIIS"]);

    // Retrieves data
    let result = await db.all("select * from testtable;");
    
    // Closes connection
    db.close();

    // Returns data
    return result;
}

module.exports = {
    get_test: () => get_test()
};