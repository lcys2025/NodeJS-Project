`mongorestore -h <hostname><:port> -d dbname <path>`

- `-h`: Specifies the hostname and port of the MongoDB server.
- `<hostname><:port>`: Replace `<hostname>` with the actual hostname of your MongoDB server and replace `<port>` with the port number.
- `-d`: Specifies the database name where the data will be restored.
- `<path>`: Specifies the path to the backup directory containing the dump files.

such as 

- `mongorestore -h localhost:27017 -d mydb /path/to/backup`
- `mongorestore -d erb ./database/erb` (run this command can restore the database)