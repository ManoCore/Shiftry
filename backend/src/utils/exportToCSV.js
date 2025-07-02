const fs = require("fs");
const path = require("path");
const User = require("../models/user");

module.exports = async () => {
  const exportDir = path.join(__dirname, "../exports");
  const exportPath = path.join(exportDir, "users.csv");

  // Ensure the exports folder exists
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const users = await User.find();
  const headers = ["_id", "firstName", "lastName", "emailId", "passwordEncrypted", "passwordIV", "status", "createdAt", "updatedAt", "__v"];
  const lines = users.map(u => [
    u._id,
    u.firstName,
    u.lastName,
    u.emailId,
    u.passwordEncrypted,
    u.passwordIV,
    u.status,
    u.createdAt.toISOString(),
    u.updatedAt.toISOString(),
    u.__v
  ].join(","));

  fs.writeFileSync(exportPath, [headers.join(","), ...lines].join("\n"));
};
