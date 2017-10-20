

liquicode_scaffolding Client
==========================================


Membership
------------------------------------------


Membership
------------------------------------------

### Member Authentication


### Member Profile Storage


### Member File System


Document Database (NoSql)
------------------------------------------

### Database Functions

- `Count( Collection, Query, callback )`: Counts the number of documents in a collection.
	- `Collection`: The name of the collection to use.
	- `Query`: The query defining which documents to count.
		Pass an empty `{}` object to count all documents in the collection.
	- `callback`: A function taking the prarameters `( err, response )`
		to be called when the database operation has completed.

- `Find( Collection, Query, Projection, callback )`: Finds documents in a collection.
	- `Collection`: The name of the collection to use.
	- `Query`: The query defining which documents to find.
		Pass an empty `{}` object to find all documents in the collection.
	- `callback`: A function taking the prarameters `( err, response )`
		to be called when the database operation has completed.


Logger
------------------------------------------

### Log Targets


##### Log Flags


##### Log Devices


