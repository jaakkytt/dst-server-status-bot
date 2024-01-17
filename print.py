import subprocess
import sys
import time

# DST game server console commands that dump additional info to server logs
console_command = 'c_dumpseasons(); c_listallplayers()'

# Reference defined in https://github.com/Jamesits/docker-dst-server/
process_reference = 'supervisorctl fg dst-server:dst-server-master'

# Send the command
process = subprocess.Popen(process_reference, shell=True, stdin=subprocess.PIPE)
process.stdin.write(console_command.encode())

# Closing the pipe before the command gets executed by the process cancels the output, so we sleep
time.sleep(1)

# Close the pipe and exit
process.stdin.close()
sys.exit(0)
