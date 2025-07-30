use erb;

db.createCollection("user");

db.runCommand({
    insert: "users",
    documents: [
        { name : "Norris", username : "Norris", password : "123456", email : "norris@gmail.com" },
        { name : "Verstappen", username : "Verstappen", password : "123456", email : "verstappen@gmail.com" },
        { name : "Bearman", username : "Bearman", password : "123456", email : "bearman@gmail.com" },
        { name : "Gasly", username : "Gasly", password : "123456", email : "gasly@gmail.com" }
    ]
});