postdeploy: npm run postdeploy
# Do not call npm start directly
# npm does not forward process signals (e.g. SIGINT / SIGKILL ...)
# see https://github.com/1024pix/pix/pull/796
# and https://github.com/npm/npm/issues/4603
# for more information
web: cd api && echo "$OAUTH2_PROXY_HPASSWD_CONTENT" > "$OAUTH2_PROXY_HPASSWD_FILE" && /app/bin/start_with_oauth2_proxy.sh exec node index.js
