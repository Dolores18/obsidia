<%*
const { execSync } = require('child_process');
try {
  let output = execSync('termux-exec node /data/data/com.termux/files/home/scripts/hello.js').toString();
  tR += output;
} catch (error) {
  tR += "Error executing script: " + error.message;
}
%>
