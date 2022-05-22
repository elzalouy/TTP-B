const fs = require("fs");
const Path = require("path");

export function deleteAll() {
  let dir = __dirname.split("services");
  const directory = Path.join(dir[0], "uploads");
  fs.readdir(directory, (err: any, files: any) => {
    if (err) throw err;
    for (const file of files) {
      if (file !== ".placeholder")
        fs.unlink(Path.join(directory, file), (err: any) => {
          if (err) throw err;
        });
    }
  });
}
