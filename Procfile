postdeploy: npm run postdeploy
# Do not call npm start directly
# npm does not forward process signals (e.g. SIGINT / SIGKILL ...)
# see https://github.com/1024pix/pix/pull/796
# and https://github.com/npm/npm/issues/4603
# for more information
web: node bin/www
background: node ./start-scheduler
