use erb;

db.createCollection("user");

db.runCommand({
  insert: "user",
  documents: [
    { name : "Norris", username : "Norris", password : "123456" },
    { name : "Verstappen", username : "Verstappen", password : "123456" },
    { name : "Bearman", username : "Bearman", password : "123456" },
    { name : "Gasly", username : "Gasly", password : "123456" }
  ]
});