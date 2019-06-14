/**
 * This handler manages the communication of the NED Server and the ZoKrates environment
 */
const { exec } = require("child_process");
const { workingDir, fileName, executionEnv } = require("../ned-server-config");

module.exports = {
  // TODO trigger the netting by calling the zokrates bash file
  triggerNetting: async householdTransaction => {
    /**
     * Executing the Bash file
     */
    console.log(workingDir, fileName, executionEnv);
    exec(
      executionEnv + " " + fileName,
      { cwd: workingDir },
      (err, stdout, stderr) => {
        if (err) {
          console.log(`stderr: ${stderr}`);
          throw err;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
  }
};
